const Image = require("./Image")

const ImageRepo = {
    async createImage(image) {
        const result = await Image.create(image);
        return result.id;
    }
}

module.exports = ImageRepo