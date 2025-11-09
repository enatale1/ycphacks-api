class Event {
    constructor(
        id,
        eventName,
        startDate,
        endDate,
        canChange,
        isActive
    ) {
        this.id = id
        this.eventName = eventName
        this.startDate = startDate
        this.endDate = endDate
        this.canChange = canChange
        this.isActive = isActive
    }

    validate(isCreate = true) {
        const errors = {};
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/; // Checks for 'YYYY-MM-DDTHH:mm:ss.sssZ' format

        // 1. Validate id
        if (!isCreate && (!this.id || this.id < 0)) {
            errors.id = "ID is required for updating";
        }

        // 2. Validate name presence and length
        if (!this.eventName) {
            errors.eventName = "Name is required";
        } else if (this.eventName.length > 100) {
            errors.eventName = "Name cannot be more than 100 characters";
        }

        // 3. Validate start date presence and start date is in valid format
        if (!this.startDate) {
            errors.startDate = "Date is required";
        } else if (!dateRegex.test(this.startDate)) {
            errors.startDate = "Invalid date format";
        }

        // 4. Validate end date presence, end date is in valid format, and end date is not before start date
        if (!this.endDate) {
            errors.endDate = "Date is required";
        } else if (!dateRegex.test(this.endDate)) {
            errors.endDate = "Invalid date format";
        } else if (this.startDate && Date.parse(this.endDate) <= Date.parse(this.startDate)) {
            errors.endDate = "Date cannot be before the start date"
        }

        return errors;
    }
}

module.exports = Event