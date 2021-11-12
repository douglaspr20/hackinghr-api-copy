module.exports = {
  NEW_USER_SIGNUP: {
    subject: () => `WOW! You are in the Hacking HR LAB! THANK YOU!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      Thank you so much for joining the Hacking HR LAB!
      </p>
      <p>
      Check out all the tools we have available here: <a href="https://www.hackinghrlab.io/join">https://www.hackinghrlab.io/join</a>
      </p>
      <p>
      I have to say: how cool and awesome is to have you in this platform. We built it for you… and you made it! THANK YOU.
      </p>
      <p>
      We have a bunch of great features and content for you. And we are working nonstop in product development and improvement. That means that you will be seeing changes and a lot of more value every time you log in.
      </p>
      <p>
      If you think this is a good place for you to invest some money, please become a PREMIUM member for $99 a year. Just click on UPGRADE. You will get access to EVERYTHING. And when I say EVERYTHING, I mean everything that we have now and everything we will develop and deploy in the future.
      </p>
      <p>
      Well. Long email… 
      </p>
      <p>
      For now, THANK YOU for being here and do not hesitate to let me know about feedback, comments, ideas, questions, stories or anything else. I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
      </p>
      <p>
      THANK YOU!
      </p>
      <p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  USER_BECOME_PREMIUM: {
    subject: () => `Wowza! You are now a PREMIUM MEMBER of the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      It is… let me think… ok… WONDERFUL, AMAZING, AWESOME and GREAT that you became a PREMIUM member of the Hacking HR LAB!
      </p>
      <p>
      Thank you so much!
      </p>
      <p>
      You will now have access to all the PREMIUM tools we have available (including the new ones coming up!). Please make sure you use everything… thoroughly! There’s a lot of content and features for you.
      </p>
      <p>
      And PLEASE, like really PLEASE, if there is something that isn’t working properly (techy bugs… they happen!), something we can improve, or a tool that you’d love to see and we don’t have, just shoot me an email and let me know about it. I can’t promise that we will move faster than the speed of light (whoops that’s impossible!), but we are pretty fast to fix bugs, improve existing features and create new ones.
      </p>
      <p>
      I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a> and, as always, right at you service and honor to serve you!
      </p>
      <p>
      THANK YOU!
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  EVENT_REMINDER_24_HOURS: {
    subject: (event) => `${event.title} is coming up in one day!`,
    body: (user, event, startDate, startTime) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      We are so excited you are joining us at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      We look forward to seeing you on ${startDate} at ${startTime}.
      </p>
      <p>
      This is the link to connect: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  EVENT_REMINDER_45_MINUTES: {
    subject: (event) => `Almost here! Coming up in two hours: ${event.title}`,
    body: (user, event) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      The time has come!
      </p>
      <p>
      See you in two hours at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      Connect this link: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  PARTICIPANTS_LIST_TO_ORGANIZER: {
    subject: () => `PARTICIPANTS LIST`,
    body: (event, users) => `
      <h3>${event.title}</h3>
      <p>
      ${users
        .map((user) => {
          return `
          ${user.firstName} ${user.lastName},     ${user.email}
          <br />
      `;
        })
        .join("")}
      </p>
    `,
  },
  PODCAST_SERIES_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the podcast series "${title}"`,
    body: (user, podcastSeries) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Podcast Series "${podcastSeries.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        This podcast series awards:
      </p>
      <p>
        ${podcastSeries.hrCreditOffered}
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${podcastSeries.shrmCode}
        <br>
        <strong>HRCI: </strong>${podcastSeries.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more podcast series.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  LIBRARY_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the library "${title}"`,
    body: (user, library) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning into Hacking HR's Library content: "${library.title}".
      <p>
        We hope you enjoy the content. PLEASE share with your network!
      </p>
      <p>
        The HR recertification codes are:
        <br>
        <strong>SHRM: </strong>${library.shrmCode}
        <br>
        <strong>HRCI: </strong>${library.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you continue enjoying the content!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_CREDIT: {
    subject: (title) =>
      `Hacking HR's Event: "${title}" (HR recertification credits included)`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining the ${event.organizer}'s event: "${
      event.title
    }".
      <p>
        We hope you enjoyed the event!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      ${
        event.showClaim === 1
          ? `
            <p>
              The SHRM/HRCI codes for this event are:
              <br>
              <strong>SHRM: </strong>${event.shrmCode}
              <br>
              <strong>HRCI: </strong>${event.hrciCode}
            </p>
      `
          : ""
      }
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_ATTENDANCE: {
    subject: (title) => `Hacking HR's Event: ${title}`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining us at ${event.title} organized by ${event.organizer}.
      <p>
      <p>
        The HR attendance code is: ${event.code}
      </p>
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  COURSE_CLAIM: {
    subject: (title) => ` Thank you for participating in the course "${title}"`,
    body: (user, course) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Course "${course.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${course.shrmCode}
        <br>
        <strong>HRCI: </strong>${course.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more courses.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  BONFIRE_INVITATION: {
    subject: `You have been invited to a bonfire! A networking experience as part of the 
    Hacking HR 2022 Global Online Conference`,
    body: (
      user,
      bonfire,
      bonfireCreator,
      startDate,
      startTime,
      endTime,
      timezone,
      googleLink,
      yahooLink
    ) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      You have been selected to join the bonfire "${bonfire.title}" on ${startDate} at ${startTime}-${endTime} (${timezone}), 
      created by ${bonfireCreator.firstName} ${bonfireCreator.lastName} (${bonfireCreator.email}).
      </p>
      <p>
      Bonfires are networking opportunities as part of the Hacking HR 2022 Global Online 
      Conference. Participants of the conference can create bonfires and we select a 
      group of other participants to join. Like a “professional blind date”! 
      </p>
      <p>
      This bonfire is about “${bonfire.description}” and you were invited because you have 
      interests that align with the topic of this conversation! 
      </p>
      <p>
      We hope you can join. 
      </p>
      <p>
      This is the link to connect: <a target="_blank" href="${bonfire.link}">${bonfire.link}</a>
      </p>
      <p>
      Attached a calendar invite including all details, just in case! 
      </p>
      <p>
      <a href="${googleLink}" target="_blank"></a>
      <a href="${yahooLink}" target="_blank"></a>
      </p>
      <p>
      Happy networking! 
      </p>
      <br />
      <br />
      Hacking HR LAB
      <br/>
      <p>
      P.S.: Bonfires <b>ARE NOT</b> tools for sales or marketing pitches. If this happens during 
      your bonfire and the bonfire organizer is selling anything, marketing a product or 
      service, or using you for any purpose other than networking, please report it to us 
      (enrique@hackinghr.io). We will take immediate action.
      </p>
    `,
  },
  BONFIRE_CREATOR: {
    subject: `Thank you creating a Bonfire as part of the networking experience at the 
    Hacking HR 2022 Global Online Conference`,
    body: (bonfireCreator, bonfire, startDate, startTime, timezone) => `
    <p>
    Hi, ${bonfireCreator.firstName}
    </p>
    <p>
    Thank you so much for creating the bonfire: "${bonfire.title}" on ${startDate} at ${startTime} (${timezone})
    </p>
    <p>
    <b>Quick note before moving on: time zones are always a headache for 
    everyone. PLEASE make sure that you entered the proper time zone when 
    creating your Bonfire. Thank you!.</b>
    </p>
    <p>
    You are so AWESOME!!! THANK YOU!
    </p>
    <p>
    We created Bonfires as a cool and valuable way for networking as part of the 
    Hacking HR 2022 Global Online Conference. We are thankful with you for creating 
    this space for meaningful conversation and networking.
    </p>
    <p>
    Based on areas of interest, we have selected 20 conference participants to join your
    bonfire and sent them the invitations via email. We hope they join! But please feel 
    free to promote as well in your network.
    </p>
    <p>
    Also, we added the bonfire in the “Bonfire” list in the <a href="https://www.hackinghrlab.io/global-conference">Conference application</a> 
    so that anyone can find it and join!
    </p>
    <p>
    One last thing: as the creator of the Bonfire you have a wonderful opportunity to 
    shape the conversation to be meaningful and valuable for those who join you. We 
    count on you to facilitate a wonderful space that is safe, respectful and tolerant, 
    and partisan political conversations or sales pitches are not allowed and 
    immediately stopped.
    </p>
    <p>Thank you so much!!!</p>
    <p>
    Happy networking! 
    </p>
    <br>
    <br>
    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hacking HR</p>
    <br>
    `,
  },
  BONFIRE_JOINING: {
    subject: `Thank you for joining a Bonfire as part of the networking experience at the 
    Hacking HR 2022 Global Online Conference`,
    body: (user, bonfire, bonfireCreator, startDate, startTime) => `
    <p>
    Hi ${user.firstName}
    </p>
    <p>
    Thank you for joining the bonfire: “${bonfire.title}” on ${startDate} at ${startTime}, 
    created by ${bonfireCreator.firstName} ${bonfireCreator.lastName} (${bonfireCreator.email})!
    </p>
    <p>
    Bonfires are networking opportunities as part of the Hacking HR 2022 Global Online 
    Conference. Participants of the conference can create bonfires and we select a 
    group of other participants to join. Like a “professional blind date”! 
    </p>
    <p>
    This bonfire is about “${bonfire.description}” and you were invited because you have 
    interests that align with the topic of this conversation!
    </p>
    <p>
    This is the link to connect: ${bonfire.link}
    </p>
    <p>
    Attached a calendar invite including all details, just in case!
    </p>
    <br>
    <br>
    <p>
    Happy networking!
    </p>
    <br>
    <p>
    Hacking HR LAB
    </p>
    <br>
    <p>
    P.S.: Bonfires <b>ARE NOT</b> tools for sales or marketing pitches. If this happens during 
    your bonfire and the bonfire organizer is selling anything, marketing a product or 
    service, or using you for any purpose other than networking, please report it to us 
    (enrique@hackinghr.io). We will take immediate actio
    </p>
    `,
  },
  JOIN_COHORT_EMAIL: {
    subject: (cohort, startDate) => `
    Welcome to Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (user, cohort, startDate) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Welcome to Hacking HR's ProjectX!
    </p>  
    <p>
      We are so excited to have you join the cohort ${cohort.title} starting on ${startDate}!
    </p>
    <p>
      We created this tool with one idea in mind: to help you learn or improve your knowledge in ${cohort.title} through daily resources, personal reflections and assessment of your fellow cohort participants’ reflections! 
    </p>
    <p>
    This program is intense, but light touch: we will provide a daily resource that should last less than 15-20 minutes to read, listen or watch. Then you provide your personal reflection about what you learned and you plan to apply the lessons learned. Finally, you will look at some of the reflections provided by other participants’ and provide your feedback. 
    </p>
    <p>
    This cohort lasts 66 days. The program includes a weekly meeting with a small group of cohort participants. In addition, mid-way into the program and at the end of the program you will have to provide a resolution to a business case we will be posting. 
    </p>
    <p>
    The program relies on daily consistency and discipline. Instead of bugging you with heavy daily resources and long programs that lasts for hours and months, we only ask you for 20 minutes or less on a daily basis for 66 days. That’s it! 
    </p>
    <p>
      Enjoy the program. Happy learning. And please do not hesitate to reach out if you have any questions: enrique@hackinghr.io
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Enrique Rubio <br>
      Founder <br>
      Hacking HR <br>
    </p>
    `,
  },
  DAILY_RESOURCE: {
    subject: (resource) => `
      Today's Resource is: ${resource.title}
    `,
    body: (user, cohort, resource) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Today’s resource as part of the Cohort ${cohort.title} is: <br> <br>
      - ${resource.title} <br>
      - Type: ${resource.type} <br>
      - Link: ${resource.resourceLink} <br>
      - Estimated duration: ${resource.duration} minutes <br>
    </p>
    <p>
      Please remember to: <br> <br>
      -	Provide your response to today’s question about this resource in the cohort dashboard. <br>
      -	Assess the responses provided by other cohort participants
    </p>
    <p>
    Please remember that to stay enrolled in this cohort you must provide your daily reflection and daily assessment on other cohort participants' reflections. You are allowed only to miss two reflections or two assessments in any given week.
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  KICK_OUT: {
    subject: () => `
      You have missed two mandatory activities – you can’t join this cohort anymore
    `,
    body: (user) => `
    <p>
      Hi ${user.firstName}
    </p>
    <p>
      Unfortunately you have missed two mandatory activities this week. We understand that life and work happen and perhaps other priorities came up and you had to reallocate your time. It’s ok. 
    </p>
    <p>
      We hope you can join a future cohort on the same skill or any other similar skill. 
    </p>
    <p>
      You won’t be able to join this cohort’s dashboard anymore and you will not receive any more information about it. 
    </p>
    <p>
      Thank you for your understanding. 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  WITHDRAW_PARTICIPATION: {
    subject: (cohort) =>
      `You have withdrawn from Hacking HR's ProjectX: ${cohort.title}`,
    body: (user) => `
    <p>
      Hi ${user.firstName}, <br>
    </p>
    <p>
      We are sorry to see you withdraw from the cohort. We hope everything is well! <br>
    </p>
    <p>
    Don't worry, though, if you can't join this time. We have many more cohorts and skills coming up! <br>
    </p>
    <p>
    Thank you so much! <br>
    </p>
    <p>
      Hacking HR Team
    </p>
    `,
  },
};
