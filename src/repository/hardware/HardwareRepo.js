const Hardware = require("./Hardware");
const { Sponsor, EventSponsor, SponsorTier } = require("../config/Models");
const HardwareImage = require('./HardwareImage');

const HardwareRepo = {
    async findHardwareById(id) {
        return Hardware.findOne({
            where: { id },
            include: [{
                model: HardwareImage,
                as: 'images',
                attributes: ['imageUrl', 'id']
            }]
        });
    },

    async findAllHardware() {
        return Hardware.findAll({
            include: [{
                model: HardwareImage,
                as: 'images',
                attributes: ['imageUrl']
            }]
        });
    },

    async groupHardware() {
        const hardwareList = await Hardware.findAll({
            attributes: [
                'id', 'hardwareName', 'description', 'serial', 'whoHasId',
            ],
            include: [{
                model: HardwareImage,
                as: 'images',
                attributes: ['imageUrl'],
                limit: 1
            }]
        });

        const grouped = {};
        const multiWordFamilies = await this.findMultiWordFamilies(hardwareList);

        hardwareList.forEach(item => {

            const isUnavailable = item.whoHasId !== null;

            let groupTitle = item.hardwareName.split(" ")[0];
            let subtitle = item.hardwareName.split(" ").slice(1).join(" ");

            for(const fam of multiWordFamilies){
                if(item.hardwareName.startsWith(fam)){
                    groupTitle = fam;
                    subtitle = item.hardwareName.replace(fam, "").trim();
                    break;
                }
            }

            if(!grouped[groupTitle]){
                grouped[groupTitle] = {
                    id: groupTitle.toLowerCase().replace(/\s+/g, "-"),
                    title: groupTitle,
                    items: []
                };
            }

            const imageUrl = item.images && item.images.length > 0 ? item.images[0].imageUrl : null;

            grouped[groupTitle].items.push({
                fullName: item.hardwareName,
                isUnavailable: isUnavailable,
                name: subtitle || groupTitle,
                subtitle: subtitle,
                description: item.description || "",
                image: imageUrl
            });
        });
        return Object.values(grouped);
    },

    async findAllHardwareAdmin() {
        return Hardware.findAll({
            attributes: ['id', 'hardwareName', 'serial', 'functional', 'description'],
            include: [{ model: HardwareImage, as: 'images', attributes: ['id', 'imageUrl', 'hardwareId'] }]
        });
    },
    async getAvailabilityList(){
        const hardwareList = await Hardware.findAll({
            attributes: ['hardwareName', 'serial']
        });

        const mappedList =  hardwareList.map(item => ({
            name: item.hardwareName,
            serialNumber: item.serial,
        }));

        return mappedList;
    },

    async createHardware(hardware) {
        return await Hardware.create(hardware);
    },

    async updateHardware(id, updatedFields) {
        return Hardware.update(updatedFields, {
            where: { id },
            individualHooks: true
        });
    },

    async deleteHardware(id) {
        return Hardware.destroy({
            where: { id },
            individualHooks: true
        });
    },

    async findMultiWordFamilies(hardwareList) {
        const prefixCounts = new Map();
        const familyCandidates = new Set();

        hardwareList.forEach(item => {
            const words = item.hardwareName.split(/\s+/).filter(w => w.length > 0);

            if (words.length >= 3) {
                const prefix3 = words.slice(0, 3).join(" ");
                prefixCounts.set(prefix3, (prefixCounts.get(prefix3) || 0) + 1);
            }

            if (words.length >= 2) {
                const prefix2 = words.slice(0, 2).join(" ");
                prefixCounts.set(prefix2, (prefixCounts.get(prefix2) || 0) + 1);
            }
        });

        prefixCounts.forEach((count, prefix) => {
            if (count >= 2) {
                let shouldAdd = true;
                for (const existingFamily of familyCandidates) {
                    if (prefix.startsWith(existingFamily + ' ')) {
                        shouldAdd = false;
                        break;
                    }
                }
                if (shouldAdd) {
                    familyCandidates.add(prefix);
                }
            }
        });

        return Array.from(familyCandidates);
    },

    async getImagesByHardwareId(hardwareId) {
        return HardwareImage.findAll({
            where: { hardwareId: hardwareId },
            attributes: ['id', 'imageUrl', 'hardwareId']
        });
    },

    async createHardwareImage({ imageUrl, hardwareId }) {
        return HardwareImage.create({
            imageUrl: imageUrl,
            hardwareId: hardwareId
        });
    },

    async deleteHardwareImage(imageId) {
        const deletedRows = await HardwareImage.destroy({
            where: { id: imageId }
        });
        return deletedRows;
    }
};

module.exports = HardwareRepo;