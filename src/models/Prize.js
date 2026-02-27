class Prize {
    constructor(
        id,
        eventId,
        prizeName,
        categoryId,
        placement,
        handedOut
    ) {
        this.id = id;
        this.eventId = eventId;
        this.prizeName = prizeName;
        this.categoryId = categoryId;
        this.placement = placement;
        this.handedOut = handedOut;
    }
}

module.exports = Prize