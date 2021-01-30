module.exports = {
  MENTOR_EMAIL: (source, target) => `
    <p>
      Hi, ${source.firstName} and ${target.firstName}, 
    </p>
      ${source.firstName}, you are interested in mentoring ${target.firstName}, based on both your interests.
    <p>
      We wanted to connect you both and let you take it from here.
    </p>
    <p>
      Thank you!
    </p>
    <p>
      Hacking HR Team.
    </p>
  `,
  MENTEE_EMAIL: () => `
    <p>
      Hi, ${source.firstName} and ${target.firstName}, 
    </p>
    <p>
      ${source.firstName}, you are interested in becoming a mentee of ${target.firstName}, based on both your interests.
    </p>
    <p>
      We wanted to connect you both and let you take it from here.
    </p>
    <p>
      Thank you!
    </p>
    <p>
      Hacking HR Team.
    </p>
  `,
};
