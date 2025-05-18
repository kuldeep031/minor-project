const Request = require('../models/Request');
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');
const Admin = require('../models/Admin');
const axios = require('axios');

exports.createrequest = async (req, res) => {
    try {
        const request = new Request(req.body);
        await request.save();
        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get requests by faculty name
exports.getreqbyfaculty = async (req, res) => {
    try {
        const { name } = req.body;
        const requests = await Request.find({ Faculty: name }); // Assuming `Faculty` is the field name
        if (!requests.length) {
            return res.status(404).json({ message: 'No requests found for the given faculty' });
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve a request
exports.getapproved = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await Request.updateOne(
            { _id: id },
            { $set: { Approved: true } }
        );
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'No pending requests found to approve' });
        }
        res.json({ message: 'Request approved successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get approved requests for a faculty
exports.getapprovedreq = async (req, res) => {
    try {
        let { facultyId, semester, year } = req.body;

        if (!facultyId || semester == undefined || year == undefined) {
            return res.status(400).json({ message: "Faculty ID, semester, and year are required" });
        }

        // Convert semester & year to numbers since they are stored as numbers in MongoDB
        semester = Number(semester);
        year = Number(year);

        // Ensure facultyId is an ObjectId if stored as such
        const requests = await Request.find({
            Approved: true, 
            Faculty: new mongoose.Types.ObjectId(facultyId),
            semester: semester,  
            year: year  
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching approved requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



  exports.getPendingRequests = async (req, res) => {
    try {
        const { facultyId } = req.body; // Extract faculty ID from request body

        if (!facultyId) {
            return res.status(400).json({ message: "Faculty ID is required" });
        }

        // Fetch requests where status is 'pending' and faculty matches the given ID
        const requests = await Request.find({ Status: "pending", Faculty: facultyId });
        

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.findReq = async (req, res) => {
    try {
        const { id, semester } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid team member ID format" });
        }
        const objectId = new mongoose.Types.ObjectId(id);

        // Convert semester to integer
        const semesterNumber = parseInt(semester);
        if (isNaN(semesterNumber)) {
            return res.status(400).json({ message: "Invalid semester number" });
        }

        // Find request where any teamMember._id matches the given id and semester matches
        const request = await Request.findOne({
            "teamMembers.id": objectId,  
            semester: semesterNumber
        });

        if (!request) {
            return res.status(404).json({ message: "No request found for this team member ID and semester." });
        }

        res.status(200).json(request);
    } catch (error) {
        console.error("Error fetching request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProjectsByEvaluators = async (req, res) => {
    try {
        const { facultyIds, semester, year } = req.body;

        if (!facultyIds || facultyIds.length === 0) {
            return res.status(400).json({ message: "No evaluators found" });
        }

        // Fetch projects where faculty matches any evaluator's faculty ID
        const projects = await Request.find({
            Faculty: { $in: facultyIds },
            semester: semester,
            year: year,
            Approved : true
        });

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getfilteredStudents = async (req, res) => {
    try {
      const { semester, batch } = req.params;
      
      // Find all requests in the same semester/batch with pending/accepted status
      const activeRequests = await Request.find({
        semester,
        batch, // Optional: if batch is tied to branch
        Status: { $in: ["pending", "accepted"] }
      });
  
      // Extract all student IDs already in requests
      const activeStudentIds = activeRequests.flatMap(request => 
        request.teamMembers.map(member => member.id)
      );
  
      res.status(200).json({ activeStudentIds });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  // Add this new method
  exports.getAcceptedCount = async (req, res) => {
    try {
        const { semester, batch } = req.body;
        // Convert to numbers safely
        const semesterNum = parseInt(semester);
        const batchNum = parseInt(batch);
        
        // Validate the numbers
        if (isNaN(semesterNum) || isNaN(batchNum)) {
            return res.status(400).json({ 
                error: "Invalid format",
                message: "Semester and batch must be valid numbers"
            });
        }

        const count = await Request.countDocuments({ 
            semester: semesterNum,
            batch: batchNum,
            Status: "accepted"
        });
        
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error in getAcceptedCount:", error);
        res.status(500).json({ 
            error: "Server error",
            details: error.message 
        });
    }
};

// Update the existing updateRequestStatus method
exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId, status, temp, groupNo } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({ message: "Request ID and status are required" });
        }

        const updateData = { 
            Status: status, 
            Approved: temp 
        };

        // Only add GroupNo if it's provided (for accepted requests)
        if (groupNo !== undefined) {
            updateData.GroupNo = groupNo;
        }

        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(201).json({ 
            message: `Request updated to ${status}`,
            updatedRequest 
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getProjectsByYearSemester = async (req, res) => {
    try {
        const { year, semester } = req.body;

        if (!year || !semester) {
            return res.status(400).json({ error: "Year and semester are required" });
        }

        // Find all approved requests for the selected year and semester
        const projects = await Request.find({
            year: parseInt(year),
            semester: parseInt(semester),
            Approved: true
        })
        .populate('Faculty', 'name')
        .populate('chairId', 'name')
        .sort({ batch: 1, GroupNo: 1 });

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Server error while fetching projects" });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await Request.findById(requestId)
            .populate('chairId', 'signature name')
            .populate('Faculty', 'signature name');

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Get admin signature
        const admin = await Admin.findOne({ email: 'admin@gmail.com' }, 'signature name');
        
        // Create PDF with proper page management
        const doc = new PDFDocument({ 
            margin: 50,  // Slightly increased margins for better readability
            size: 'A4',
            bufferPages: true
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Project_Report_${request.Title.replace(/\s+/g, '_')}.pdf`
        );

        doc.pipe(res);

        // ===== STYLES =====
        const colors = {
            primary: '#2c3e50',
            secondary: '#3498db',
            accent: '#27ae60',
            light: '#f8f9fa',
            dark: '#212529',
            gray: '#6c757d'
        };

        // Helper function to check remaining space and add new page if needed
        const ensureSpace = (neededSpace, paddingTop = 20) => {
            const currentY = doc.y;
            const remainingSpace = doc.page.height - currentY - doc.page.margins.bottom;
            
            if (remainingSpace < neededSpace) {
                doc.addPage();
                return doc.page.margins.top + paddingTop;
            }
            return currentY + paddingTop;
        };

        // ===== PAGE 1: HEADER & PROJECT DETAILS =====
        // College Header with Logo
        doc.fillColor(colors.primary)
           .rect(0, 0, doc.page.width, 100)
           .fill();
           
          const logoUrl = 'https://raw.githubusercontent.com/swapnilsparsh/college-logos/main/iiit-naya-raipur.png';
  
  try {
    const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'base64');

    // Step 2: Add logo to PDF
    doc.image(imageBuffer, 50, 50, { width: 100 }); // x=50, y=50, width=100px

    // Step 3: Add some text below logo
    doc.fontSize(18).text('My College Project', 50, 160);

    // Finish the PDF
    doc.end();

    writeStream.on('finish', () => {
      console.log('PDF created successfully!');
    });

  } catch (error) {
    console.error('Failed to fetch image:', error.message);
  }

        // College Name
        doc.fillColor('#ffffff')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Dr. Shyama Prasad Mukherjee International Institute', 120, 30)
           .text('of Information Technology, Naya Raipur', 120, 50);

        // Report Title
        doc.fillColor(colors.primary)
           .fontSize(18)
           .font('Helvetica-Bold')  // Make title bold
           .text('PROJECT EVALUATION REPORT', 0, 120, {
               align: 'center'
           })
           .moveDown(1);  // Add space after title

        // ===== IMPROVED PROJECT DETAILS SECTION =====
        // Project Details Section Header with attractive styling
        doc.font('Helvetica-Bold')
           .fillColor(colors.primary)
           .fontSize(16)
           .text('PROJECT DETAILS', doc.page.margins.left, doc.y);

        // Add more prominent decorative underline
        doc.moveTo(doc.page.margins.left, doc.y)
           .lineTo(doc.page.margins.left + 180, doc.y)
           .strokeColor(colors.primary)
           .lineWidth(2)
           .stroke();
        doc.moveDown(1);

        // Create an info box with light background for project details
        const infoBoxX = doc.page.margins.left;
        const infoBoxY = doc.y;
        const infoBoxWidth = doc.page.width - (doc.page.margins.left * 2);
        const infoBoxHeight = 150; // Estimated height, will adjust based on content

        // Draw info box with rounded corners and light background
        doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 5)
           .fillColor(colors.light)
           .fill()
           .strokeColor(colors.gray)
           .lineWidth(0.5)
           .stroke();

        // Reset position for content
        doc.y = infoBoxY + 15;
        doc.x = infoBoxX + 20;

        // Details Table with better structure and visual hierarchy
        const details = [
            ['Title:', request.Title],
            ['Faculty:', request.facultyName],
            ['Year/Semester:', `${request.year} / Sem ${request.semester}`],
            ['Batch:', request.batch],
            ['Status:', request.Status.toUpperCase()]
        ];

        // Create a proper two-column layout with enhanced styling
        const labelWidth = 130;
        const labelX = infoBoxX + 20;
        const valueX = labelX + labelWidth;
        const rowSpacing = 22; // Increased spacing between rows

        details.forEach(([label, value], index) => {
            const rowY = doc.y;
            
            // Draw label with accent color and bold font
            doc.font('Helvetica-Bold')
               .fillColor(colors.primary)
               .fontSize(11)
               .text(label, labelX, rowY);
            
            // Draw value with regular font and dark color
            doc.font('Helvetica')
               .fillColor(colors.dark)
               .fontSize(11)
               .text(value, valueX, rowY, { 
                   width: infoBoxWidth - labelWidth - 40,
                   align: 'left'
               });
            
            // Add subtle separator line except for the last item
            if (index < details.length - 1) {
                doc.moveTo(labelX, rowY + rowSpacing - 5)
                   .lineTo(infoBoxX + infoBoxWidth - 20, rowY + rowSpacing - 5)
                   .strokeColor(colors.gray)
                   .lineWidth(0.2)
                   .stroke();
            }
            
            doc.y = rowY + rowSpacing;
        });

        doc.moveDown(1);  // Add extra space after project details

        // ===== TEAM EVALUATION TABLE =====
        // Calculate space needed for team table
        const rowHeight = 25;  // Increased for better readability
        const tableHeaderHeight = 30;
        const tableFooterHeight = 20;
        const tableNeededHeight = tableHeaderHeight + (rowHeight * request.teamMembers.length) + tableFooterHeight;
        
        // Ensure we have enough space for at least the header and a few rows
        let currentY = ensureSpace(Math.min(tableNeededHeight, 200));

        doc.font('Helvetica-Bold')
           .fillColor(colors.primary)
           .fontSize(14)
           .text('TEAM MEMBERS EVALUATION', doc.page.margins.left, currentY);
        
        // Add decorative underline
        doc.moveTo(doc.page.margins.left, doc.y)
           .lineTo(doc.page.margins.left + 220, doc.y)
           .strokeColor(colors.primary)
           .lineWidth(1)
           .stroke();
        
        doc.moveDown(0.5);
        currentY = doc.y;

        // Table Configuration - improved spacing
        const tableConfig = {
            x: doc.page.margins.left,
            y: currentY,
            width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
            rowHeight: rowHeight,
            cols: [
                { width: 30, align: 'center' },  // No.
                { width: 120, align: 'left' },   // Name
                { width: 80, align: 'center' },  // Roll No
                { width: 80, align: 'center' },  // Branch
                { width: 70, align: 'center' },  // Mid Term
                { width: 70, align: 'center' },  // End Term
                { width: 70, align: 'center' }   // Grade
            ]
        };

        // Ensure total width equals table width
        let totalColWidth = tableConfig.cols.reduce((sum, col) => sum + col.width, 0);
        const widthDiff = tableConfig.width - totalColWidth;
        
        // Adjust last column if needed
        if (widthDiff !== 0) {
            tableConfig.cols[tableConfig.cols.length - 1].width += widthDiff;
        }

        // Draw Table Header with improved styling
        doc.fillColor(colors.primary)
           .rect(tableConfig.x, tableConfig.y, tableConfig.width, tableConfig.rowHeight)
           .fill();
        
        const headers = ['No.', 'Name', 'Roll No', 'Branch', 'Mid Term', 'End Term', 'Grade'];
        let colX = tableConfig.x;
        doc.fillColor('#ffffff')
           .fontSize(10)
           .font('Helvetica-Bold');  // Bold headers
        
        headers.forEach((header, i) => {
            doc.text(header, colX + 5, tableConfig.y + (tableConfig.rowHeight / 2) - 5, {
                width: tableConfig.cols[i].width - 10,
                align: tableConfig.cols[i].align
            });
            colX += tableConfig.cols[i].width;
        });

        // Draw Table Rows with vertical lines for better readability
        let rowY = tableConfig.y + tableConfig.rowHeight;
        
        // Function to draw table cell with borders
        const drawTableCell = (x, y, width, height, text, align, isHeader = false) => {
            // Cell borders
            doc.lineWidth(0.5)
               .strokeColor(colors.gray)
               .rect(x, y, width, height)
               .stroke();
            
            // Cell text
            doc.fillColor(isHeader ? '#ffffff' : colors.dark)
               .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
               .fontSize(isHeader ? 10 : 9)
               .text(text.toString(), x + 5, y + (height / 2) - 4, {
                    width: width - 10,
                    align: align,
                    valign: 'center'
               });
        };

        request.teamMembers.forEach((member, index) => {
            // Check for page break with enough space for header
            if (rowY + tableConfig.rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                rowY = doc.page.margins.top;
                
                // Repeat table header on new page
                doc.fillColor(colors.primary)
                   .rect(tableConfig.x, rowY, tableConfig.width, tableConfig.rowHeight)
                   .fill();
                
                colX = tableConfig.x;
                headers.forEach((header, i) => {
                    doc.fillColor('#ffffff')
                       .fontSize(10)
                       .font('Helvetica-Bold')
                       .text(header, colX + 5, rowY + (tableConfig.rowHeight / 2) - 5, {
                           width: tableConfig.cols[i].width - 10,
                           align: tableConfig.cols[i].align
                       });
                    colX += tableConfig.cols[i].width;
                });
                rowY += tableConfig.rowHeight;
            }

            // Row background - alternate colors for better readability
            doc.fillColor(index % 2 === 0 ? colors.light : '#ffffff')
               .rect(tableConfig.x, rowY, tableConfig.width, tableConfig.rowHeight)
               .fill();
            
            // Row data with borders
            const data = [
                index + 1,
                member.name,
                member.roll,
                member.branch,
                member.midTermMarks ?? '-',
                member.endTermMarks ?? '-',
                member.grade ?? '-'
            ];
            
            colX = tableConfig.x;
            data.forEach((text, i) => {
                drawTableCell(
                    colX, 
                    rowY, 
                    tableConfig.cols[i].width, 
                    tableConfig.rowHeight, 
                    text, 
                    tableConfig.cols[i].align
                );
                colX += tableConfig.cols[i].width;
            });
            
            rowY += tableConfig.rowHeight;
        });

        // ===== SIGNATURES PAGE =====
        // Calculate space needed for signatures section
        const sigSectionHeight = 200;  // Height needed for signature section
        
        // Ensure adequate space or create new page
        rowY = ensureSpace(sigSectionHeight, 40);

        doc.font('Helvetica-Bold')
           .fillColor(colors.primary)
           .fontSize(14)
           .text('APPROVALS', doc.page.margins.left, rowY);
        
        // Add decorative underline
        doc.moveTo(doc.page.margins.left, doc.y)
           .lineTo(doc.page.margins.left + 100, doc.y)
           .strokeColor(colors.primary)
           .lineWidth(1)
           .stroke();
        
        doc.moveDown(1);
        rowY = doc.y;

        // Signature boxes with improved layout and styling
        const signatures = [
            { 
                title: 'Chairperson', 
                signature: request.chairId?.signature,
                name: request.chairId?.name || 'Not Assigned'
            },
            { 
                title: 'Supervisor', 
                signature: request.Faculty?.signature,
                name: request.Faculty?.name || 'Not Assigned'
            },
            { 
                title: 'Administrator', 
                signature: admin?.signature,
                name: admin?.name || 'Admin'
            }
        ];

        const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const sigWidth = Math.min(150, (availableWidth / 3) - 20);
        const sigHeight = 80;
        const sigSpacing = (availableWidth - (sigWidth * 3)) / 2;
        
        signatures.forEach((sig, i) => {
            const sigX = doc.page.margins.left + (i * (sigWidth + sigSpacing));
            
            // Box with border for signature
            doc.rect(sigX, rowY, sigWidth, sigHeight)
               .fillColor('#ffffff')
               .fill()
               .strokeColor(colors.gray)
               .lineWidth(1)
               .stroke();
            
            // Signature image with proper positioning
            if (sig.signature) {
                doc.image(sig.signature, sigX + 10, rowY + 10, {
                    fit: [sigWidth - 20, sigHeight - 40],
                    align: 'center',
                    valign: 'center'
                });
            } else {
                doc.fillColor(colors.gray)
                   .fontSize(9)
                   .text('(No Signature)', sigX, rowY + sigHeight/2 - 5, {
                       width: sigWidth,
                       align: 'center'
                   });
            }
            
            // Title and name with consistent styling
            doc.fillColor(colors.primary)
               .font('Helvetica-Bold')
               .fontSize(10)
               .text(sig.title, sigX, rowY + sigHeight - 25, {
                   width: sigWidth,
                   align: 'center'
               });
            
            doc.fillColor(colors.dark)
               .font('Helvetica')
               .fontSize(9)
               .text(sig.name, sigX, rowY + sigHeight - 10, {
                   width: sigWidth,
                   align: 'center'
               });
        });

        // Date field with line
        doc.moveDown(4);
        const dateY = doc.y;
        
        doc.fillColor(colors.dark)
           .fontSize(11)
           .text('Date:', doc.page.width / 2 - 100, dateY, { continued: true })
           .font('Helvetica');
           
        // Add underline for date field
        doc.moveTo(doc.page.width / 2 - 50, dateY + 14)
           .lineTo(doc.page.width / 2 + 100, dateY + 14)
           .strokeColor(colors.gray)
           .lineWidth(0.5)
           .stroke();

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: "Error generating PDF report" });
    }
};



// src="https://upload.wikimedia.org/wikipedia/en/8/81/International_Institute_of_Information_Technology%2C_Naya_Raipur_logo.png"