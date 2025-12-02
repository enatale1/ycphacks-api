const Image = require('./Image');

class SponsorImage extends Image {

    constructor(url, sponsorId, id = null) {
        super(url);
        this.id = id;
        this.sponsorId = sponsorId;
    }


    validate() {
        const errors = super.validate();

        if (this.sponsorId === undefined || this.sponsorId === null) {
            errors.push("Missing Sponsor ID");
        }
        if (typeof this.sponsorId !== 'number' || this.sponsorId <= 0) {
            errors.push("Invalid Sponsor ID");
        }

        return errors;
    }

    toJSON() {
        return {
            id: this.id,
            imageUrl: this.url,
            sponsorId: this.sponsorId
        };
    }
}

module.exports = SponsorImage;