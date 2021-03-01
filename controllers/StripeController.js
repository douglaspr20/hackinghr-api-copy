const db = require("../models");
const HttpCodes = require("http-codes");

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SK_KEY);

const User = db.User;

const StripeController = () => {
  /**
   * Function to create stripe checkout session object
   * and return to redirect.
   * @param {*} req 
   * @param {*} res 
   */
  const createCheckoutSession = async (req, res) => {
    const { priceId } = req.body;
    const { id } = req.token;

    if (priceId) {
      
      const user = await User.findOne({
        where: {
          id,
        },
      });

      try {
        const session = await stripe.checkout.sessions.create({
          customer_email: user.email,
          success_url: process.env.STRIPE_CALLBACK_URL,
          cancel_url: process.env.STRIPE_CALLBACK_URL,
          payment_method_types: ['card'],
          line_items: [
            { price: priceId, quantity: 1 },
          ],
          mode: 'subscription',
          allow_promotion_codes: true,
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

        await User.update({
          memberShip: 'premium'
        }, {
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
