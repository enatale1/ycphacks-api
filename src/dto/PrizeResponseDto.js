class PrizeResponseDto {
    constructor(
        id,
        prizeName,
        eventId
    ) {
        this.id = id;
        this.prizeName = prizeName;
        this.eventId = eventId;
    }
}

module.exports = PrizeResponseDto;