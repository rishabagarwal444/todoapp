// import React, { useState, useEffect } from "react";
// import { db, auth } from "./firebase";
// import {
//   collection,
//   addDoc,
//   doc,
//   updateDoc,
//   getDocs,
//   query,
//   where,
//   arrayUnion,
// } from "firebase/firestore";
// import { DragDropContext, Droppable } from "react-beautiful-dnd";
// import Task from "./Task";
// import { toast } from "react-toastify";
// import { v4 as uuidv4 } from "uuid";  // Use uuid for unique IDs
// import "./ToDoList.css"; 

// function ToDoList() {
//   const [todoListName, setTodoListName] = useState("");
//   const [taskTitle, setTaskTitle] = useState("");
//   const [taskDescription, setTaskDescription] = useState("");
//   const [taskDueDate, setTaskDueDate] = useState("");
//   const [taskPriority, setTaskPriority] = useState("");
//   const [toDoLists, setToDoLists] = useState([]);

//   // Fetch To-Do lists owned by the user
//   const fetchToDoLists = async () => {
//     const q = query(collection(db, "ToDoLists"), where("owner", "==", auth.currentUser.uid));
//     const querySnapshot = await getDocs(q);
//     const lists = [];
//     querySnapshot.forEach((doc) => {
//       lists.push({ id: doc.id, ...doc.data() });
//     });
//     setToDoLists(lists);
//   };

//   // Create a new To-Do List
//   const handleCreateToDoList = async () => {
//     try {
//       await addDoc(collection(db, "ToDoLists"), {
//         name: todoListName,
//         owner: auth.currentUser.uid,
//         tasks: [],
//       });
//       toast.success("To-Do List created successfully!");
//       setTodoListName(""); // Clear input field after creation
//       fetchToDoLists();
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Add a new task to a list
//   const handleAddTask = async (listId) => {
//     if (!taskTitle || !taskDescription || !taskDueDate || !taskPriority) {
//       toast.error("Please fill in all task details!");
//       return;
//     }

//     const task = {
//       id: uuidv4(), // Use UUID for unique task ID
//       title: taskTitle,
//       description: taskDescription,
//       dueDate: taskDueDate,
//       priority: taskPriority,
//     };

//     try {
//       const listRef = doc(db, "ToDoLists", listId);
//       await updateDoc(listRef, {
//         tasks: arrayUnion(task),
//       });
//       toast.success("Task added successfully!");

//       // Clear the task input fields after adding
//       setTaskTitle("");
//       setTaskDescription("");
//       setTaskDueDate("");
//       setTaskPriority("");

//       fetchToDoLists(); // Fetch updated lists
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Handle drag-and-drop
//   const handleDragEnd = async (result) => {
//     const { destination, source } = result;

//     if (!destination) return; // Do nothing if no destination

//     if (destination.droppableId === source.droppableId && destination.index === source.index) {
//       return; // No changes if dropped in the same place
//     }

//     const sourceList = toDoLists.find((list) => list.id === source.droppableId);
//     const destList = toDoLists.find((list) => list.id === destination.droppableId);

//     if (!sourceList || !destList) {
//       toast.error("Error finding list");
//       return;
//     }

//     // Clone tasks array
//     const sourceTasks = Array.from(sourceList.tasks);
//     const [movedTask] = sourceTasks.splice(source.index, 1); // Remove task from source list

//     if (sourceList.id === destList.id) {
//       // Reordering tasks within the same list
//       sourceTasks.splice(destination.index, 0, movedTask); // Insert task at new index in the same list

//       // Update Firestore with reordered tasks in the same list
//       try {
//         await updateDoc(doc(db, "ToDoLists", sourceList.id), { tasks: sourceTasks });

//         // Update local state with new task order
//         setToDoLists((prevLists) =>
//           prevLists.map((list) =>
//             list.id === sourceList.id ? { ...list, tasks: sourceTasks } : list
//           )
//         );
//       } catch (error) {
//         toast.error("Error updating task order: " + error.message);
//       }
//     } else {
//       // Moving tasks between different lists
//       const destTasks = Array.from(destList.tasks);
//       destTasks.splice(destination.index, 0, movedTask); // Insert task in destination list

//       try {
//         // Update both source and destination lists in Firestore
//         await updateDoc(doc(db, "ToDoLists", sourceList.id), { tasks: sourceTasks });
//         await updateDoc(doc(db, "ToDoLists", destList.id), { tasks: destTasks });

//         // Update local state with updated task lists
//         setToDoLists((prevLists) =>
//           prevLists.map((list) =>
//             list.id === sourceList.id
//               ? { ...list, tasks: sourceTasks }
//               : list.id === destList.id
//               ? { ...list, tasks: destTasks }
//               : list
//           )
//         );
//       } catch (error) {
//         toast.error("Error moving task: " + error.message);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchToDoLists();
//   }, []);

//   return (
//     <div>
//       <h4>Create New To-Do List</h4>
//       <input
//         type="text"
//         value={todoListName}
//         onChange={(e) => setTodoListName(e.target.value)}
//         placeholder="Enter To-Do List Name"
//       />
//       <button onClick={handleCreateToDoList}>Create List</button>

//       <DragDropContext onDragEnd={handleDragEnd}>
//         {toDoLists.map((list) => (
//           <Droppable key={list.id} droppableId={list.id}>
//             {(provided) => (
//               <div
//                 {...provided.droppableProps}
//                 ref={provided.innerRef}
//                 style={{
//                   background: "lightblue",
//                   padding: "10px",
//                   margin: "10px",
//                 }}
//               >
//                 <h5>{list.name}</h5>
//                 <Task tasks={list.tasks} listId={list.id} />
//                 {provided.placeholder}

//                 {/* Task input form */}
//                 <div>
//                   <h5>Add Task</h5>
//                   <input
//                     type="text"
//                     value={taskTitle}
//                     onChange={(e) => setTaskTitle(e.target.value)}
//                     placeholder="Enter Task Title"
//                   />
//                   <input
//                     type="text"
//                     value={taskDescription}
//                     onChange={(e) => setTaskDescription(e.target.value)}
//                     placeholder="Enter Task Description"
//                   />
//                   <input
//                     type="date"
//                     value={taskDueDate}
//                     onChange={(e) => setTaskDueDate(e.target.value)}
//                   />
//                   <input
//                     type="text"
//                     value={taskPriority}
//                     onChange={(e) => setTaskPriority(e.target.value)}
//                     placeholder="Enter Priority"
//                   />
//                   <button onClick={() => handleAddTask(list.id)}>Add Task</button>
//                 </div>
//               </div>
//             )}
//           </Droppable>
//         ))}
//       </DragDropContext>
//     </div>
//   );
// }

// export default ToDoList;

import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Task from "./Task";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import "./ToDoList.css";  // Import the CSS file for styling

function ToDoList() {
  const [todoListName, setTodoListName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [toDoLists, setToDoLists] = useState([]);

  const fetchToDoLists = async () => {
    const q = query(collection(db, "ToDoLists"), where("owner", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const lists = [];
    querySnapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() });
    });
    setToDoLists(lists);
  };

  const handleCreateToDoList = async () => {
    try {
      await addDoc(collection(db, "ToDoLists"), {
        name: todoListName,
        owner: auth.currentUser.uid,
        tasks: [],
      });
      toast.success("To-Do List created successfully!");
      setTodoListName("");
      fetchToDoLists();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddTask = async (listId) => {
    if (!taskTitle || !taskDescription || !taskDueDate || !taskPriority) {
      toast.error("Please fill in all task details!");
      return;
    }

    const task = {
      id: uuidv4(),
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      priority: taskPriority,
    };

    try {
      const listRef = doc(db, "ToDoLists", listId);
      await updateDoc(listRef, {
        tasks: arrayUnion(task),
      });
      toast.success("Task added successfully!");

      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskPriority("");

      fetchToDoLists();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceList = toDoLists.find((list) => list.id === source.droppableId);
    const destList = toDoLists.find((list) => list.id === destination.droppableId);

    if (!sourceList || !destList) {
      toast.error("Error finding list");
      return;
    }

    const sourceTasks = Array.from(sourceList.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceList.id === destList.id) {
      sourceTasks.splice(destination.index, 0, movedTask);
      try {
        await updateDoc(doc(db, "ToDoLists", sourceList.id), { tasks: sourceTasks });
        setToDoLists((prevLists) =>
          prevLists.map((list) =>
            list.id === sourceList.id ? { ...list, tasks: sourceTasks } : list
          )
        );
      } catch (error) {
        toast.error("Error updating task order: " + error.message);
      }
    } else {
      const destTasks = Array.from(destList.tasks);
      destTasks.splice(destination.index, 0, movedTask);
      try {
        await updateDoc(doc(db, "ToDoLists", sourceList.id), { tasks: sourceTasks });
        await updateDoc(doc(db, "ToDoLists", destList.id), { tasks: destTasks });

        setToDoLists((prevLists) =>
          prevLists.map((list) =>
            list.id === sourceList.id
              ? { ...list, tasks: sourceTasks }
              : list.id === destList.id
              ? { ...list, tasks: destTasks }
              : list
          )
        );
      } catch (error) {
        toast.error("Error moving task: " + error.message);
      }
    }
  };

  useEffect(() => {
    fetchToDoLists();
  }, []);

  return (
    <div className="todo-container">
      <h4 className="todo-title">Create New To-Do List</h4>
      <input
        type="text"
        className="input-field"
        value={todoListName}
        onChange={(e) => setTodoListName(e.target.value)}
        placeholder="Enter To-Do List Name"
      />
      <button className="create-btn" onClick={handleCreateToDoList}>
        Create List
      </button>

      <DragDropContext onDragEnd={handleDragEnd}>
        {toDoLists.map((list) => (
          <Droppable key={list.id} droppableId={list.id}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="list-container"
              >
                <h5 className="list-title">{list.name}</h5>
                <Task tasks={list.tasks} listId={list.id} />
                {provided.placeholder}

                <div className="task-form">
                  <h5>Add Task</h5>
                  <input
                    type="text"
                    className="input-field"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter Task Title"
                  />
                  <input
                    type="text"
                    className="input-field"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter Task Description"
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    placeholder="Enter Priority"
                  />
                  <button className="add-btn" onClick={() => handleAddTask(list.id)}>
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
}

export default ToDoList;
