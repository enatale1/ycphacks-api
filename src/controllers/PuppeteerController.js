const puppeteer = require("puppeteer")
const TeamRepo = require("../repository/team/TeamRepo")
const EventParticipantsRepo = require("../repository/Team/EventParticipantRepo")
class PuppeteerController {
    static async createPDF(req, res) {
            const {eventId} = req.params;

            try {
                const teamsFromDb = await TeamRepo.getAllTeams();

                const teams = await Promise.all(teamsFromDb.map(async team => {
                    const participants = await EventParticipantsRepo.findParticipantsByTeamId(team.dataValues.id);
                    const formattedParticipants = participants.map(p => ({
                        id: p.participants.id,
                        firstName: p.participants.firstName,
                        lastName: p.participants.lastName,
                        email: p.participants.email
                    }));

                    return {
                        id: team.dataValues.id,
                        name: team.dataValues.teamName,
                        projectName: team.dataValues.projectName,
                        participants: formattedParticipants
                    };
                }));

                const html = createHTML(teams);

                const browser = await puppeteer.launch({
                    headless: "new",
                    args: ["--no-sandbox"]
                });

                const page = await browser.newPage();
                await page.setContent(html, {waitUntil: "networkidle0"});

                const pdfBuffer = await page.pdf({
                    format: "A4",
                    printBackground: true,
                    margin: {
                        top: "20mm",
                        bottom: "20mm",
                        left: "15mm",
                        right: "15mm"
                    }
                });

                await browser.close();

                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename=teams-${eventId}.pdf`,
                    "Content-Length": pdfBuffer.length
                });
                res.end(pdfBuffer);

            } catch (err) {
                console.error("Error generating PDF:", err);
                res.status(500).json({error: "Failed to generate PDF"});
            }
    }
}
function createHTML(teams) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>PDF</title>
    <meta charset="UTF-8" />
    <style>
      @page {
        size: A4;
        margin: 20mm 15mm;
      }

      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }

      h1 {
        text-align: center;
        margin-bottom: 30px;
      }

      .team {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }

      .team-name {
        font-size: 18px;
        font-weight: bold;
        border-bottom: 2px solid #333;
        padding-bottom: 5px;
        margin-bottom: 10px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        font-size: 12px;
      }

      th {
        background-color: #f2f2f2;
      }

      .page-break {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <h1>Team Report</h1>

    ${teams.map(team => `
      <div class="team">
        <div class="team-name">${team.name}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            ${team.participants.map((p, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${p.firstName + ' ' + p.lastName}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="comments" style="margin-bottom: 300px;">
          <strong>Comments:</strong>
        </div>
      </div>
    `).join("")}

  </body>
  </html>
  `;
}
module.exports = PuppeteerController;