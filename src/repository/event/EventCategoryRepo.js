const EventCategory = require("./EventCategory")


const EventCategoryRepo = {
    async createCategory(category) {
        return EventCategory.create({
            ...category
        });
    },
    async getCategoryById(id) {
        return EventCategory.findOne({
            where: { id: id }
        });
    },
    async getCategoriesByEventId(eventId) {
        return EventCategory.findAll({
            where: { eventId: eventId }
        });
    },
    async updateCategory(category) {
        return EventCategory.update(
            {...category},
            {
                where: { id: category.id },
                individualHooks: true
            }
        );
    },
    async deleteCategory(id) {
        return EventCategory.destroy(
    {
                where: { id: id },
                individualHooks: true }
        )
    },
}

module.exports = EventCategoryRepo;