const db = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");

const User = db.User;
const SpeakersPanel = db.SpeakerPanel;
const SpeakerMemberPanel = db.SpeakerMemberPanel

const SpeakersController = () => {

    const addNewPanelSpeaker = async (req, res) => {
        const { panels } = req.body;

        const { OwnerId, description, endDate, startDate, timeZone, panelName } = panels

        try {

            const user = await User.findOne({
                where: { id: OwnerId, role: "admin" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.BAD_REQUEST)
                .json({ msg: "You must to be admin" });
            }

            const panelsSpeakers = await SpeakersPanel.create({
                OwnerId, 
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName
            },{order: [["id", "DESC"]]})

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const allPanelSpeakers = async (req, res) => {
        const { id } = req.user.dataValues;

        try {

            const { dataValues: user } = await User.findOne({
                where: { id: id, speakersAuthorization: "accepted" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.BAD_REQUEST)
                .json({ msg: "Host user not found" });
            }

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const addUserSpeakerToPanel = async (req, res) => {
        const { data } = req.body;
        const {usersNames, bul, panel} = data

        const { id, role } = req.user.dataValues;

        let panelsSpeakers

        try {

            if(role === "admin"){

                const response = await Promise.all(
                    usersNames.map(async (user) => {
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: user[0], SpeakersPanelId: panel.id},
                        })
    
                        if(!userReadyJoin){
    
                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user[2],
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user[1],panel),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user[1],
                                        panel,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );
    
                            await SpeakerMemberPanel.create({
                                UserId: user[0], 
                                SpeakersPanelId: panel.id, 
                                isModerator: bul, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }else{
                const userReadyJoin = await SpeakerMemberPanel.findOne({
                    where: { UserId: id, SpeakersPanelId: panel.id},
                })

                if(userReadyJoin){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You are ready join to this panel." });
                }

                const userLimit = await SpeakerMemberPanel.findAll({
                    where: { UserId: id },
                })

                if(userLimit.length > 1){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "User can't join to more of two panels." });
                }

                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: usersNames[0][2],
                        subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(usersNames[0][1],panel.panelName),
                        html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                            usersNames[0][1],
                            panel,
                        ),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                await SpeakerMemberPanel.create({
                    UserId: usersNames[0][0], 
                    SpeakersPanelId: panel.id, 
                    isModerator: bul, 
                })
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const removeUserSpeakerToPanel = async (req, res) => {
        const { UserId } = req.body;

        const { id } = req.user.dataValues;

        try {

            const user = await User.findOne({
                where: { id: id, role: "admin" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.NOT_FOUND)
                .json({ msg: "You must to be admin" });
            }

            await SpeakerMemberPanel.destroy({
                where:{ id: UserId}
            })

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const sendEmailRegisterConference2023 = async (req, res) => {

        const { email, firstName } = req.user.dataValues;

        try{
            await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: email,
                    subject: LabEmails.REGISTER_CONFERENCE_2023.subject(),
                    html: LabEmails.REGISTER_CONFERENCE_2023.body(firstName),
                    };
        
                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                })()
            );
            return res.status(HttpCodes.OK);   
        }catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    return {
        addNewPanelSpeaker,
        allPanelSpeakers,
        addUserSpeakerToPanel,
        removeUserSpeakerToPanel,
        sendEmailRegisterConference2023
    }
}

module.exports = SpeakersController;