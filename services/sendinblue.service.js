const moment = require("moment-timezone");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const { formatEmailBlogsPostWeekly } = require("../utils/formatEmails");
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

  const updateWeeklyBlogPostEmailTemplate = async (blogs) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiInstance2 = new SibApiV3Sdk.EmailCampaignsApi();
    let emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();
    let smtpTemplate = new SibApiV3Sdk.UpdateSmtpTemplate();

    smtpTemplate.htmlContent = formatEmailBlogsPostWeekly(blogs);

    const templateId = process.env.NODE_ENV === "production" ? 313 : 315;

    emailCampaigns = {
      sender: {
        id: 5,
      },
      name: "Blog Post test",
      templateId,
      scheduledAt: moment().add(5, "minutes").format(),
      subject: "test blogs subject",
      recipients: { listIds: [41] },
    };

    try {
      const data = await apiInstance.updateSmtpTemplate(
        templateId,
        smtpTemplate
      );
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );

      const data2 = await apiInstance2.createEmailCampaign(emailCampaigns);

      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data2)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    updateWeeklyDigestEmailTemplate,
    updateWeeklyBlogPostEmailTemplate,
  };
};

module.exports = sendInBlueService;
