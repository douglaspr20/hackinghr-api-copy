const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;

const sendInBlueService = () => {
  let apiKey = defaultClient.authentications["api-key"];
  apiKey["apiKey"] = process.env.SEND_IN_BLUE_API_KEY;

  const sendWeeklyDigest = async (emails, jobs, resources) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.SEND_IN_BLUE_SMTP_SENDER,
    };
    sendSmtpEmail.to = emails;
    sendSmtpEmail.params = {
      jobs,
      resources,
    };
    sendSmtpEmail.templateId = 214;

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    sendWeeklyDigest,
  };
};

module.exports = sendInBlueService;
