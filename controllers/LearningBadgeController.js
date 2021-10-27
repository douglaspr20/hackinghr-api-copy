const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const isEmpty = require("lodash/isEmpty");
const { literal, Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;

const LearningBadgeController = () => {
  /**
   * Method to get all Post objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      let query = `
      select
            u.email,
            u."firstName",
            u."lastName",
            SUM(main_data.duration) / 1000 as hours
        from
            (
            select
                'podcastseries' as element,
                cast(coalesce(ps.duration, '0') as float) as duration,
                ps.id,
                psd.key,
                psd.value
            from
                "PodcastSeries" ps
            join json_each_text(ps.viewed) psd on
                true
        union
            select
                'conference_library' as element,
                cast(coalesce(cl.duration, '0') as float) as duration,
                cl.id,
                cld.key,
                cld.value
            from
                "ConferenceLibraries" cl
            join json_each_text(cl.viewed) cld on
                true
        union
            select
                'library' as element,
                cast(coalesce(l.duration, '0') as float) as duration,
                l.id,
                ld.key,
                ld.value
            from
                "Libraries" l
            join json_each_text(l.viewed) ld on
                true
        union
            select
                'podcast' as element,
                cast(coalesce(p.duration, '0') as float) as duration,
                p.id,
                pd.key,
                pd.value
            from
                "Podcasts" p
            join json_each_text(p.viewed) pd on
                true
        ) main_data
        inner join "Users" u on
            main_data.key = cast(u.id as varchar)
        where
            main_data.value = 'mark'
        group by
            u.email,
            u."firstName",
            u."lastName"
        order by
            hours desc
      `;
      const learningBadges = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      if (!learningBadges) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ learningBadges });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getAll,
  };
};

module.exports = LearningBadgeController;
