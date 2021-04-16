const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SK_KEY);

const moment = require('moment');

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
      prices.map(item => checkoutSessionPrinces.push({ price: item, quantity: 1 }));

      const user = await User.findOne({
        where: {
          id,
        },
      });

      try {
        let sessionData = {
          success_url: process.env.STRIPE_CALLBACK_URL,
          cancel_url: process.env.STRIPE_CALLBACK_URL,
          payment_method_types: ['card'],
          line_items: checkoutSessionPrinces,
          mode: 'subscription',
          allow_promotion_codes: true,
        };
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          sessionData["customer"] = customers.data[0].id;
        } else {
          sessionData["customer_email"] = user.email;
        }
        
        const session = await stripe.checkout.sessions.create(sessionData);
        return res
          .status(HttpCodes.OK)
          .json(session)
          .send();
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" })
          .send();
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Internal server error" })
      .send();
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

        return res
          .status(HttpCodes.OK)
          .json({ session })
          .send();
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null })
          .send();
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" })
        .send();
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
        ]

        for (let item of premiumPrices) {
          const premiumSubscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            price: item,
            limit: 1,
          });
          if (premiumSubscriptions.data.length > 0) {
            subscription = premiumSubscriptions.data[0];
            break;
          }
        }

        return res
          .status(HttpCodes.OK)
          .json({ subscription })
          .send();
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null })
          .send();
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" })
        .send();
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
      console.log("********* STRIPE Webhook *************");
      console.log(`********* Type ${type} *************`);
      if (type === 'customer.subscription.created') {
        console.log(data.object);

        let newUserData = {};
        const { customer } = data.object;
        const customerInformation = await stripe.customers.retrieve(
          customer
        );
        
        const user = await User.findOne({
          where: {
            email: customerInformation.email.toLowerCase()
          },
        });

        if (user.memberShip == "free") {
          newUserData = { "memberShip": "premium" };
          let premiumPrices = [
            process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
            process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_ID,
            process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_ID,
          ];

          for (let item of premiumPrices) {
            const premiumSubscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              price: item,
              limit: 1,
            });
            if (premiumSubscriptions.data.length > 0) {
              const item = premiumSubscriptions.data[0];
              newUserData["subscription_startdate"] = moment.unix(item.current_period_start).format("YYYY-MM-DD HH:mm:ss");
              newUserData["subscription_enddate"] = moment.unix(item.current_period_end).format("YYYY-MM-DD HH:mm:ss");
              break;
            }
          }
        }

        let channelsPrices = [
          process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_CHANNELS_ID,
          process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_CHANNELS_ID,
          process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_CHANNELS_ID,
        ];

        for (let channelsItem of channelsPrices) {
          const channelsSubscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            price: channelsItem,
            limit: 1,
          });
          if (channelsSubscriptions.data.length > 0) {
            const channelsSubscription = channelsSubscriptions.data[0];
            newUserData["channelsSubscription"] = true;
            if (user.role !== "admin") {
              newUserData["role"] = UserRoles.CHANNEL_ADMIN;
            }
            newUserData["channelsSubscription_startdate"] = moment.unix(channelsSubscription.current_period_start).format("YYYY-MM-DD HH:mm:ss");
            newUserData["channelsSubscription_enddate"] = moment.unix(channelsSubscription.current_period_end).format("YYYY-MM-DD HH:mm:ss");
            break;
          }
        }

        await User.update(newUserData, {
          where: { email: customerInformation.email.toLowerCase() }
        });
      }
      return res
        .status(HttpCodes.OK)
        .send();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" })
        .send();
    }
  }

  return {
    createCheckoutSession,
    createPortalSession,
    getSubscription,
    webhook,
  };
};

module.exports = StripeController;
