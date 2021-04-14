const db = require("../models");
const HttpCodes = require("http-codes");

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
        let additionalData = {};
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });

        if(customers.data.length > 0){
          additionalData["customer"] = customers.data[0].id;
        }else{
          additionalData["customer_email"] = user.email;
        }

        const session = await stripe.checkout.sessions.create({
          success_url: process.env.STRIPE_CALLBACK_URL,
          cancel_url: process.env.STRIPE_CALLBACK_URL,
          payment_method_types: ['card'],
          line_items: checkoutSessionPrinces,
          mode: 'subscription',
          allow_promotion_codes: true,
          ...additionalData
        });
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
      if(customers.data.length > 0){
        const customer = customers.data[0];
        const session = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: process.env.STRIPE_CALLBACK_URL,
        });

        return res
          .status(HttpCodes.OK)
          .json({ session })
          .send();
      }else {
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
      if(customers.data.length > 0){
        const customer = customers.data[0];
        const subscription = customer.subscriptions.data[0];

        return res
          .status(HttpCodes.OK)
          .json({ subscription })
          .send();
      }else {
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
      if (type === 'customer.subscription.created') {
        const { customer } = data.object;
        const customerInformation = await stripe.customers.retrieve(
          customer
        );
        
        let newUserData = { memberShip: 'premium' };

        if(customerInformation.subscriptions.data.length > 0){
          const subscription = customerInformation.subscriptions.data[0];
          newUserData["subscription_startdate"] = moment.unix(subscription.current_period_start).format("YYYY-MM-DD HH:mm:ss");
          newUserData["subscription_enddate"] = moment.unix(subscription.current_period_end).format("YYYY-MM-DD HH:mm:ss");
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
