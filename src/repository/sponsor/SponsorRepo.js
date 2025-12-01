const { Sponsor, SponsorTier, EventSponsor, Image } = require("../config/Models");

const SponsorRepo = {
    //Sponsor
    async findSponsorById(id){
        return Sponsor.findOne({
            where: { id },
            attributes: ['id', 'sponsorName', 'sponsorWebsite'],
            include: [{ model: SponsorTier, as: "tiers", attributes: ["tier"] }]
        });
    },
    async findAllSponsors() {
      return Sponsor.findAll({
        attributes: ['id', 'sponsorName', 'sponsorWebsite'],
        include: [
          {
            model: EventSponsor,
            as: 'EventSponsors',
            include: [
              { model: SponsorTier, as: 'SponsorTier', attributes: ['tier'] }
            ]
          }
//          { model: Image, as: 'image', attributes: ['url'] } // adjust field
        ]
      });
    },
    async createSponsor(sponsor){
        return Sponsor.create(sponsor);
    },
    async updateSponsor(id, updates){
        return Sponsor.update(updates, {where: {id}, individualHooks: true});
    },
    async deleteSponsorById(id){
        return Sponsor.destroy({where: {id}, individualHooks: true});
    },

    //EventSponsor
    async findEventSponsorsById(id){
        return EventSponsor.findAll({
            where: { id },
            include: [{model: Sponsor, include: {model: Image}}, {model: SponsorTier}]
        });
    },
    async findEventSponsorsByEvent(eventId){
        return EventSponsor.findAll({
            where: {event_id: eventId},
            include: [{model: Sponsor, include: {model: Image}}, {model: SponsorTier}]
        });
    },
    async createEventSponsor(eventSponsor){
        return EventSponsor.create(eventSponsor);
    },

    //SponsorTier
    async createSponsorTier(sponsorTier){
        return SponsorTier.create(sponsorTier);
    },
    async deleteSponsorTierById(id){
        return SponsorTier.destroy({
            where: { id },
            individualHooks: true
        });
    },
    async getAllSponsorTier(){
        return SponsorTier.findAll({});
    }
}

module.exports = SponsorRepo;