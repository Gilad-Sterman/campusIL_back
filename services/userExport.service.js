import { Parser } from 'json2csv';

class UserExportService {
    async generateUsersCSV(users) {
        const fields = [
            { label: 'First Name', value: 'first_name' },
            { label: 'Last Name', value: 'last_name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Country', value: 'country' },
            { label: 'Date of Birth', value: 'date_of_birth' },
            { label: 'Role', value: 'role' },
            { label: 'Status', value: 'status' },
            { label: 'Quiz Status', value: 'quizStatus' },
            { label: 'Concierge Status', value: 'conciergeStatus' },
            { label: 'Document Status', value: 'documentStatus' },
            { label: 'Applications', value: 'applicationCount' },
            { label: 'Joined', value: 'created_at' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(users);
        return csv;
    }
}

export default new UserExportService();
