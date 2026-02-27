const Prize = require("./Prize")


const PrizeRepo = {
    async createPrize(prize) {
        return Prize.create({
            ...prize
        });
    },
    async getPrizeById(id) {
        return Prize.findOne({
            where: { id: id }
        });
    },
    async getPrizesByEventId(eventId) {
        return Prize.findAll({
            where: { eventId: eventId }
        });
    },
    async updatePrize(prize) {
        return Prize.update(
            {...prize},
            {
                where: { id: prize.id },
                individualHooks: true
            }
        );
    },
    async deletePrize(id) {
        return Prize.destroy(
            {
                where: { id: id },
                individualHooks: true
            }
        );
    }
}

module.exports = PrizeRepo;