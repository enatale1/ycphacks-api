class UserProfileResponseDto {
    constructor(
        id,
        firstName,
        lastName,
        age,
        gender,
        pronouns,
        country,
        school,
        major,
        graduationYear,
        levelOfStudy,
        tShirtSize,
        hackathonsAttended,
        dietaryRestrictions
    ) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.age = age;
        this.gender = gender;
        this.pronouns = pronouns;
        this.country = country;
        this.school = school;
        this.major = major;
        this.graduationYear = graduationYear;
        this.levelOfStudy = levelOfStudy;
        this.tShirtSize = tShirtSize;
        this.hackathonsAttended = hackathonsAttended;
        this.dietaryRestrictions = dietaryRestrictions;
    }
}

module.exports = {UserProfileResponseDto};