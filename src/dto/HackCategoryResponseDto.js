class HackCategoryResponseDto {
    constructor(
        id,
        categoryName,
        eventId
    ) {
        this.id = id;
        this.categoryName = categoryName;
        this.eventId = eventId;
    }
}

module.exports = HackCategoryResponseDto;