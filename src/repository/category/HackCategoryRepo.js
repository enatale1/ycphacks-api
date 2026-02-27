const HackCategory = require("./HackCategory")


const HackCategoryRepo = {
    async createCategory(category) {
        return HackCategory.create({
            ...category
        });
    },
    async getCategoryById(id) {
        return HackCategory.findOne({
            where: { id: id }
        });
    },
    async getCategoriesByEventId(eventId) {
        return HackCategory.findAll({
            where: { eventId: eventId }
        });
    },
    async updateCategory(category) {
        return HackCategory.update(
            {...category},
            {
                where: { id: category.id },
                individualHooks: true
            }
        );
    },
    async deleteCategory(id) {
        return HackCategory.destroy(
    {
                where: { id: id },
                individualHooks: true }
        )
    },
}

module.exports = HackCategoryRepo;