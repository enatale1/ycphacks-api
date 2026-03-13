class HackCategory {
    constructor(
        id,
        categoryName,
        eventId
    ) {
        this.id = id
        this.categoryName = categoryName
        this.eventId = eventId
    }

    validate(isCreate = true) {
        const errors = {};

        // 1. Validate id
        if (!isCreate && (!this.id || this.id < 0)) {
            errors.id = "ID is required for updating";
        }

        // 2. Validate name presence and length
        if (!this.categoryName) {
            errors.categoryName = "Name is required";
        } else if (this.categoryName.length > 255) {
            errors.categoryName = "Name must be less than 256 characters";
        }

        // 5. Validate event ID presence
        if (!this.eventId || this.eventId < 0) {
            errors.eventId = 'Event ID is required';
        }

        return errors;
    }
}

module.exports = HackCategory