class AuditLog {
    constructor(
        id,
        tableName,
        recordId,
        action,
        oldValue,
        newValue,
        userId
    ) {
        this.id = id;
        this.tableName = tableName;
        this.recordId = recordId;
        this.action = action;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.userId = userId;
    }

    validate() {
        if (this.action === 'CREATE' && this.oldValue != null) {
            throw new Error('CREATE should not have oldValue');
        }
        if (this.action === 'DELETE' && this.newValue != null) {
            throw new Error('DELETE should not have newValue');
        }
    }
}

module.exports = AuditLog