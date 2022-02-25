const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;

const sendInBlueService = () => {
  let apiKey = defaultClient.authentications["api-key"];
  apiKey["apiKey"] = process.env.SEND_IN_BLUE_API_KEY;

  const updateWeeklyDigestEmailTemplate = async (jobs, resources) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let smtpTemplate = new SibApiV3Sdk.UpdateSmtpTemplate();

    smtpTemplate.htmlContent = `
      <html>
        <body>
          <h3>Jobs in the Talent Marketplace</h3>
          ${jobs}

          <h3>Creator's Content</h3>
          ${resources}
        </body>
      </html>
    `;

    const templateId = process.env.NODE_ENV === "production" ? 214 : 237;

    try {
      const data = await apiInstance.updateSmtpTemplate(
        templateId,
        smtpTemplate
      );
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    updateWeeklyDigestEmailTemplate,
  };
};

module.exports = sendInBlueService;
