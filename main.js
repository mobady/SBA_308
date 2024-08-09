
 // the ID of the learner for which this data has been collected
 //"id": number,
 // the learner’s total, weighted average, in which assignments
 // with more points_possible should be counted for more
 // e.g. a learner with 50/100 on one assignment and 190/200 on another
 // would have a weighted average score of 240/300 = 80%.
 //"avg": number,
 // each assignment should have a key with its ID,
 // and the value associated with it should be the percentage that
 // the learner scored on the assignment (submission.score / points_possible)
 //<assignment_id>: number,
 // if an assignment is not yet due, it should not be included in either
 // the average or the keyed dictionary of scores

 /*
 If an AssignmentGroup does not belong to its course (mismatching course_id), your program should throw an error, 
 letting the user know that the input was invalid. Similar data validation should occur elsewhere within the program.
You should also account for potential errors in the data that your program receives. What if points_possible is 0? You cannot divide by zero. 
What if a value that you are expecting to be a number is instead a string? 
Use try/catch and other logic to handle these types of errors gracefully.
If an assignment is not yet due, do not include it in the results or the average. Additionally, 
if the learner’s submission is late (submitted_at is past due_at), 
deduct 10 percent of the total points possible from their score for that assignment.
Create a function named getLearnerData() that accepts these values as parameters, 
in the order listed: (CourseInfo, AssignmentGroup, [LearnerSubmission]), 
and returns the formatted result, which should be an array of objects as described above.
You may use as many helper functions as you see fit.
*/


// Example usage of the function with provided sample data
const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript"
};

const AssignmentGroup = [{
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: "Declare a Variable",
      due_at: "2023-01-25",
      points_possible: 50
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2023-02-27",
      points_possible: 150
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "3156-11-15",
      points_possible: 500
    }
  ]
}];

const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-25",
      score: 47
    }
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-02-12",
      score: 150
    }
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-24",
      score: 39
    }
  }
];

const getCurrentDate = () => new Date();
//Function to process each submission, calculate scores, apply penalties
function processSubmission(assignment, submission) {
  const currentDate = getCurrentDate();
  const dueDate = new Date(assignment.due_at);

  if (assignment.points_possible === 0) {
    throw new Error(`Assignment ${assignment.id} has zero points possible, which is not valid for scoring.`);
  }

  if (dueDate > currentDate) {
    // If the assignment is not due yet, return null to indicate no processing needed
    return 0;
  }

  let score = submission.score;
  const isLate = new Date(submission.submitted_at) > dueDate;

  if (isLate) {
    score -= assignment.points_possible * 0.1; //  a 10% late penalty
  }

  return  {
    scorePercentage: score / assignment.points_possible,
    assignmentId: assignment.id
  };
}

// Main function to handle learner data processing
function getLearnerData(courseInfo, assignmentGroups, learnerSubmissions) {
  try {
    // Validate that all assignment groups belong to the provided course
    assignmentGroups.forEach(group => {
      if (group.course_id !== courseInfo.id) {
        throw new Error(`Assignment group ${group.id} does not belong to the course ${courseInfo.id}.`);
      }
    });

    // Object to collect results
    const learners = {};

    // Iterate over each submission
    learnerSubmissions.forEach(submission => {
      const assignmentGroup = assignmentGroups.find(group => group.assignments.some(a => a.id === submission.assignment_id));
      if (!assignmentGroup) {
        throw new Error(`No assignment group found for assignment ${submission.assignment_id}`);
      }

      const assignment = assignmentGroup.assignments.find(a => a.id === submission.assignment_id);
      const processedSubmission = processSubmission(assignment, submission.submission);

      if (processedSubmission === null) {
        return; // Skip further processing if assignment is not due yet
      }

      const { scorePercentage, assignmentId } = processedSubmission;
      if (!learners[submission.learner_id]) {
        learners[submission.learner_id] = { id: submission.learner_id, scores: {}, totalWeightedScore: 0 };
      }

      learners[submission.learner_id].scores[assignmentId] = scorePercentage;
      // Apply group weight and add to total weighted score
      learners[submission.learner_id].totalWeightedScore += scorePercentage * assignmentGroup.group_weight;
    });

    // Map results to array with calculated averages
    return Object.values(learners).map(learner => ({
      id: learner.id,
      avg: learner.totalWeightedScore / 100, // Convert to percentage
      ...learner.scores
    }));
  } catch (error) {
    console.error("Error processing learner data:", error.message);
    return [];
  }
}

// Execute the function and log results
const results = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
console.log(results);