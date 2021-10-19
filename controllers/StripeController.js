const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SK_KEY);

const moment = require("moment");

const User = db.User;

const StripeController = () => {
  /**
   * Function to create stripe checkout session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const createCheckoutSession = async (req, res) => {
    const { prices, user } = req.body;
    const { id } = req.token;

    if (prices) {
      let checkoutSessionPrinces = [];
      prices.map((item) =>
        checkoutSessionPrinces.push({ price: item, quantity: 1 })
      );

      const user = await User.findOne({
        where: {
          id,
        },
      });

      try {
        let sessionData = {
          success_url: process.env.STRIPE_CALLBACK_URL,
          cancel_url: process.env.STRIPE_CALLBACK_URL,
          payment_method_types: ["card"],
          line_items: checkoutSessionPrinces,
          mode: "subscription",
          allow_promotion_codes: true,
        };
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });

        let subscriptionExists = false;

        if (customers.data.length > 0) {
          const customer = customers.data[0];
          sessionData["customer"] = customer.id;
          if (customer.subscriptions.data.length > 0) {
            for (let subscription of customer.subscriptions.data) {
              if (
                prices.indexOf(subscription.items.data[0].price.id) > -1 &&
                subscription.status == "active"
              ) {
                subscriptionExists = true;
                break;
              }
            }
          }
        } else {
          sessionData["customer_email"] = user.email;
        }
        if (!subscriptionExists) {
          const session = await stripe.checkout.sessions.create(sessionData);
          return res.status(HttpCodes.OK).json(session);
        } else {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "The subscription is already active." });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: err.message });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Internal server error" });
  };
  /**
   * Function to get customer portal session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const createPortalSession = async (req, res) => {
    const { id } = req.token;

    const user = await User.findOne({
      where: {
        id,
      },
    });

    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        const session = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: process.env.STRIPE_CALLBACK_URL,
        });

        return res.status(HttpCodes.OK).json({ session });
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Function to get customer portal session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const getSubscription = async (req, res) => {
    const { id } = req.token;

    const user = await User.findOne({
      where: {
        id,
      },
    });

    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        let subscription = null;
        let premiumPrices = [
          process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
          process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_ID,
          process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_ID,
        ];

        for (let itemPremium of premiumPrices) {
          if (customer.subscriptions.data.length > 0) {
            for (let subItemPremium of customer.subscriptions.data) {
              if (subItemPremium.items.data[0].price.id === itemPremium) {
                subscription = subItemPremium;
                break;
              }
            }
          }
        }

        return res.status(HttpCodes.OK).json({ subscription });
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Function to manage stripe events
   * @param {*} req
   * @param {*} res
   */
  const webhook = async (req, res) => {
    const { type, data } = req.body;
    try {
      if (
        type === "customer.subscription.created" ||
        type === "customer.subscription.updated"
      ) {
        console.log("********* STRIPE Webhook *************");
        console.log(`********* Type ${type} *************`);
        let newUserData = {};
        const { customer } = data.object;
        console.log(`***** Customer: ${customer} ******`);
        const customerInformation = await stripe.customers.retrieve(customer);

        const user = await User.findOne({
          where: {
            email: customerInformation.email.toLowerCase(),
          },
        });

        console.log(`***** memberShip: ${user.memberShip} ******`);

        if (user.memberShip == "free") {
          let premiumPrices = [
            process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
            process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_ID,
            process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_ID,
          ];

          for (let itemPremium of premiumPrices) {
            if (customerInformation.subscriptions.data.length > 0) {
              for (let subItemPremium of customerInformation.subscriptions
                .data) {
                subItemPremium.items.data.map((itemSubscription) => {
                  console.log(
                    `***** PREMIUM -- Price: ${itemSubscription.price.id} / ${itemPremium} - status: ${subItemPremium.status} ******`
                  );
                  if (
                    itemSubscription.price.id === itemPremium &&
                    subItemPremium.status === "active"
                  ) {
                    newUserData["memberShip"] = "premium";
                    newUserData["subscription_startdate"] = moment
                      .unix(subItemPremium.current_period_start)
                      .format("YYYY-MM-DD HH:mm:ss");
                    newUserData["subscription_enddate"] = moment
                      .unix(subItemPremium.current_period_end)
                      .format("YYYY-MM-DD HH:mm:ss");
                  }
                });
              }
            }
          }
        }

        let channelsPrices = [
          process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_CHANNELS_ID,
          process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_CHANNELS_ID,
          process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_CHANNELS_ID,
        ];

        console.log(
          `***** CHANNELS -- channelsSubscription: ${user.channelsSubscription} ******`
        );

        if (user.channelsSubscription === false) {
          for (let channelsItem of channelsPrices) {
            if (customerInformation.subscriptions.data.length > 0) {
              for (let subChannelsItem of customerInformation.subscriptions
                .data) {
                subChannelsItem.items.data.map((itemSubscription) => {
                  console.log(
                    `***** PREMIUM -- Price: ${itemSubscription.price.id} / ${channelsItem} - status: ${subChannelsItem.status} ******`
                  );
                  if (
                    itemSubscription.price.id === channelsItem &&
                    subChannelsItem.status === "active"
                  ) {
                    newUserData["channelsSubscription"] = true;
                    if (user.role !== "admin") {
                      newUserData["role"] = UserRoles.CHANNEL_ADMIN;
                    }
                    newUserData["channelsSubscription_startdate"] = moment
                      .unix(subChannelsItem.current_period_start)
                      .format("YYYY-MM-DD HH:mm:ss");
                    newUserData["channelsSubscription_enddate"] = moment
                      .unix(subChannelsItem.current_period_end)
                      .format("YYYY-MM-DD HH:mm:ss");
                  }
                });
              }
            }
          }
        }

        console.log(`***** newUserData: ${newUserData} ******`);
        await User.update(newUserData, {
          where: { email: customerInformation.email.toLowerCase() },
        });
      }
      return res.status(HttpCodes.OK);
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    getSubscription,
    webhook,
  };
};

module.exports = StripeController;
