const EventSponsor = require("./EventSponsor");
const SponsorRepo = require("./SponsorRepo");
const Sponsor = require("./Sponsor");
const SponsorTier = require("./SponsorTier");
const Image = require("../image/Image");
const { Op } = require('sequelize');

class EventSponsorRepo {
//    Get all sponsors for a given event
    async getSponsorsByEvent(eventId) {
      return await Sponsor.findAll({
        include: [
          {
            model: EventSponsor,
            where: { eventId },
            required: false, // LEFT JOIN so sponsors without an EventSponsor row are included
            include: [
              {
                model: SponsorTier,
                attributes: ["id", "tier"],
                required: false
              }
            ]
          },
        {
            model: Image,
            attributes: ["id", "url"],
            required: false
        }
        ],
        attributes: ["id", "sponsorName", "sponsorWebsite", "sponsorImageId", "amount"]
      });
    }

//    Add a sponsor to an event with a tier
    async addSponsorToEvent(eventId, sponsorData){
        const sponsor = await SponsorRepo.createSponsor({
          sponsorName: sponsorData.sponsorName,
          sponsorWebsite: sponsorData.sponsorWebsite,
          sponsorImageId: sponsorData.sponsorImageId || null,
          amount: sponsorData.amount
        });

        const eventSponsor = await EventSponsor.create({
          eventId,
          sponsorId: sponsor.id,
          sponsorTierId: sponsorData.sponsorTierId
        });

        return { sponsor, eventSponsor };
    }

//  Update Sponsor details + tier
  async updateEventSponsor(sponsorId, updates) {
    // ... (Section 1: Sponsor Table Update - KEEP AS IS)
    
    const sponsorFieldsToUpdate = {};
    if (updates.sponsorName) sponsorFieldsToUpdate.sponsorName = updates.sponsorName;
    if (updates.sponsorWebsite) sponsorFieldsToUpdate.sponsorWebsite = updates.sponsorWebsite;
    if ('image' in updates) sponsorFieldsToUpdate.sponsorImageId = updates.image;
    if ('amount' in updates) sponsorFieldsToUpdate.amount = updates.amount;
    
    if (Object.keys(sponsorFieldsToUpdate).length > 0) {
      await Sponsor.update(sponsorFieldsToUpdate, { where: { id: sponsorId } });
    }

    // --- 2. Update EventSponsor Junction Data (Tier) ---
    if ('sponsorTierId' in updates) {
      if (!updates.eventId) throw new Error("eventId is required for EventSponsor update.");
      
      await EventSponsor.update(
        { sponsorTierId: updates.sponsorTierId }, // Data fields to update
        {
          where: {
            sponsorId: sponsorId, 
            eventId: updates.eventId,
          }
        }
      );
    }

    // --- 3. Return the updated record (KEEP AS IS) ---
    
    const updatedSponsorRecord = await this.getSponsorsByEvent(updates.eventId);
    
    return updatedSponsorRecord;
  }


  //  Remove sponsor from event
      async removeSponsorFromEvent(sponsorId, eventId) {
          return EventSponsor.destroy({ 
            where: { 
              sponsorId: sponsorId,
              eventId: eventId
            } 
          });
      }

    // Gets Sponsor Tiers
    async getSponsorTiers(){
      return await SponsorTier.findAll({
        attributes: ["id", "tier", "lowerThreshold", 'width', 'height'],
        order: [
          ['lowerThreshold', 'ASC']
        ]
      });
    }

  // Add Sponsor Tiers
  async addSponsorTier(tierData){
    return await SponsorTier.create({
      tier: tierData.tier,
      lowerThreshold: tierData.lowerThreshold,
      width: tierData.imageWidth,
      height: tierData.imageHeight,
    });
  }

  async updateSponsorTier(tierId, updates){
    const tier = await SponsorTier.findByPk(tierId);

    if(!tier){
      throw new Error(`Sponsor Tier with ID ${tierId} not found.`);
    }

    if ('tier' in updates && updates.tier !== null) {
      tier.tier = updates.tier;
    }
    
    if ('lowerThreshold' in updates && updates.lowerThreshold !== null && updates.lowerThreshold !== undefined) {
      tier.lowerThreshold = Number(updates.lowerThreshold); 
    }

    if ('width' in updates && updates.width !== null && updates.width !== undefined) {
        tier.width = Number(updates.width); 
    }

    if ('height' in updates && updates.height !== null && updates.height !== undefined) {
        tier.height = Number(updates.height);
    }

    await tier.save();
    return tier;
  }

  async removeSponsorTier(tierIdToDelete) {
    // 1. Fetch all currently active tiers, excluding the one to be deleted
    const activeTiers = await SponsorTier.findAll({
      where: { id: { [Op.ne]: tierIdToDelete } }, // Op.ne means 'not equal'
      order: [['lowerThreshold', 'ASC']]
    });

    // 2. Find all EventSponsor records linked to the deleted tier
    const sponsorsToReassign = await EventSponsor.findAll({
      where: { sponsorTierId: tierIdToDelete },
      include: [{ model: Sponsor, attributes: ['amount'] }]
    });
    
    const lowestTier = activeTiers.length > 0 ? activeTiers[0] : null;

    // 3. Loop through sponsors and find their new best tier
    const updatePromises = sponsorsToReassign.map(eventSponsor => {
      const amount = Number(eventSponsor.Sponsor.amount) || 0;
      let bestTierId = null;

      // Find the highest-value tier whose lowerThreshold is <= sponsor's amount
      for (let i = activeTiers.length - 1; i >= 0; i--) {
          const currentTier = activeTiers[i];
          if (amount >= currentTier.lowerThreshold) {
              bestTierId = currentTier.id;
              break;
          }
      }
      
      if (bestTierId === null && lowestTier) {
          bestTierId = lowestTier.id;
      }

      if (bestTierId !== null) {
        return EventSponsor.update(
            { sponsorTierId: bestTierId },
            { where: { id: eventSponsor.id } }
        );
      }
      return Promise.resolve(0);
    });

    await Promise.all(updatePromises);

    // 4. Finally, delete the tier itself
    return SponsorTier.destroy({ where: { id: tierIdToDelete } });
  }
  
}

module.exports = new EventSponsorRepo();