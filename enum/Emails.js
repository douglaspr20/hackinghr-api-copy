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
    body: (user, bonfire, bonfireCreator, startDate, startTime) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      You have been selected to join the bonfire "${bonfire.title}" on ${startDate} at ${startTime}, 
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
      Happy networking! 
      </p>
      <br />
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  BONFIRE_CREATOR: {
    subject: `Thank you creating a Bonfire as part of the networking experience at the 
    Hacking HR 2022 Global Online Conference`,
    body: (bonfireCreator, bonfire, startDate, startTime) => `
    <p>
    Hi, ${bonfireCreator.firstName}
    </p>
    <p>
    Thank you so much for creating the bonfire: "${bonfire.title}" on ${startDate} at ${startTime}
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
    <br />
    <br />
    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hacking HR</p>
    <br/>
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
    created by ${bonfireCreator.firstName} ${bonfire.lastName} (${bonfireCreator.email})!
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
    `,
  },
};
