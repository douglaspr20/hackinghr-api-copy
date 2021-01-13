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
          where: { email: customerInformation.email }
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
    webhook,
  };
};

module.exports = StripeController;
