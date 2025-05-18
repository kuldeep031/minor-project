// // controllers/groupController.js
// const Group = require('../models/Group');

// // Save a new group setting
// function getBatch(semester) {
//   const currentYear = new Date().getFullYear();
//   return currentYear - Math.floor(semester / 2);  // Admission year based on semester
// }
// const saveGroupSetting = async (req, res) => {
//   try {
//     const { semester, maxGroups, maxMembers, openWindow, deadline, year } = req.body;
//     const batch = getBatch(semester);
//     const newGroup = new Group({
//       semester,
//       maxGroups,
//       maxMembers,
//       openWindow,
//       deadline,
//       year,
//       batch
//     });

//     await newGroup.save();
//     res.status(200).json({ message: 'Group settings saved successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving group settings', error });
//   }
// };

// // Update existing group setting
// const updateGroupSetting = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { semester, maxGroups, maxMembers, openWindow, deadline, year } = req.body;
//     const batch = getBatch(semester);

//     const updatedGroup = await Group.findByIdAndUpdate(
//       id,
//       { semester, maxGroups, maxMembers, openWindow, deadline, year,batch },
//       { new: true }
//     );

//     if (!updatedGroup) {
//       return res.status(404).json({ message: 'Group setting not found' });
//     }

//     res.status(200).json({ message: 'Group setting updated successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating group setting', error });
//   }
// };

// // Delete a group setting
// const deleteGroupSetting = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedGroup = await Group.findByIdAndDelete(id);

//     if (!deletedGroup) {
//       return res.status(404).json({ message: 'Group setting not found' });
//     }

//     res.status(200).json({ message: 'Group setting deleted successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting group setting', error });
//   }
// };

// // Fetch all group settings
// const getGroupSettings = async (req, res) => {
//   try {
//     const groupSettings = await Group.find();
//     res.status(200).json(groupSettings);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching group settings', error });
//   }
// };

// module.exports = { saveGroupSetting, updateGroupSetting, deleteGroupSetting, getGroupSettings };

const Group = require('../models/Group');
const Faculty = require('../models/Faculty');
const FacultyLoad = require('../models/FacultyLoad');

// Helper function to calculate batch based on semester
function getBatch(semester) {
  const currentYear = new Date().getFullYear();
  return currentYear - Math.floor(semester / 2); // Admission year based on semester
}

// Save a new group setting and create/update FacultyLoad documents
const saveGroupSetting = async (req, res) => {
  try {
    const { semester, maxGroups, maxMembers, openWindow, deadline, year } = req.body;
    const batch = getBatch(semester);

    // Save the group settings
    const newGroup = new Group({
      semester,
      maxGroups,
      maxMembers,
      openWindow,
      deadline,
      year,
      batch,
    });
    await newGroup.save();

    // Retrieve all faculty members
    const faculties = await Faculty.find({});
    if (!faculties.length) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    // Create/update FacultyLoad for each faculty
    for (const faculty of faculties) {
      const existingFacultyLoad = await FacultyLoad.findOne({
        facultyId: faculty._id,
        semester,
        year,
      });

      if (existingFacultyLoad) {
        // Update existing FacultyLoad
        existingFacultyLoad.maxGroupsAllowed = maxGroups;
        existingFacultyLoad.maxStudentsAllowed = maxMembers;
        await existingFacultyLoad.save();
      } else {
        // Create new FacultyLoad
        const newFacultyLoad = new FacultyLoad({
          facultyId: faculty._id,
          facultyName: faculty.name,
          year,
          semester,
          maxGroupsAllowed: maxGroups,
          maxStudentsAllowed: maxMembers,
          totalGroups: 0,
          totalStudents: 0,
        });
        await newFacultyLoad.save();
      }
    }

    res.status(200).json({ message: 'Group settings and faculty loads saved successfully!' });
  } catch (error) {
    console.error('Error saving group settings:', error);
    res.status(500).json({ message: 'Error saving group settings', error });
  }
};

// Update existing group setting and update FacultyLoad documents
const updateGroupSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, maxGroups, maxMembers, openWindow, deadline, year } = req.body;
    const batch = getBatch(semester);

    // Update the group settings
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { semester, maxGroups, maxMembers, openWindow, deadline, year, batch },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group setting not found' });
    }

    // Update all FacultyLoad documents with matching semester and year
    await FacultyLoad.updateMany(
      { semester, year },
      { maxGroupsAllowed: maxGroups, maxStudentsAllowed: maxMembers }
    );

    res.status(200).json({ message: 'Group setting and faculty loads updated successfully!' });
  } catch (error) {
    console.error('Error updating group setting:', error);
    res.status(500).json({ message: 'Error updating group setting', error });
  }
};

// Delete a group setting (do not delete FacultyLoad documents)
const deleteGroupSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group setting not found' });
    }

    res.status(200).json({ message: 'Group setting deleted successfully!' });
  } catch (error) {
    console.error('Error deleting group setting:', error);
    res.status(500).json({ message: 'Error deleting group setting', error });
  }
};

// Fetch all group settings
const getGroupSettings = async (req, res) => {
  try {
    const groupSettings = await Group.find();
    res.status(200).json(groupSettings);
  } catch (error) {
    console.error('Error fetching group settings:', error);
    res.status(500).json({ message: 'Error fetching group settings', error });
  }
};

module.exports = { saveGroupSetting, updateGroupSetting, deleteGroupSetting, getGroupSettings };