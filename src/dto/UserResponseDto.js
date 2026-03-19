class UserResponseDto {
    constructor(
        id,
        email,
        firstName,
        lastName,
        token,
        role,
        isEmailVerified
    ) {
        this.id = id
        this.email = email
        this.firstName = firstName
        this.lastName = lastName
        this.token = token
        this.role = role
        this.isEmailVerified = isEmailVerified
    }
}

module.exports = UserResponseDto