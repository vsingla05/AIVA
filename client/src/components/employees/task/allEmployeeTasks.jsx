import useFetchEmployee from "../../../hooks/useFetchEmployee";
import useFetchEmployeeTasks from "../../../hooks/useFetchEmployeeTasks";
import TaskCard from "./taskCard";

export default function AllEmployeeTasks() {
  const { tasks } = useFetchEmployeeTasks();
  const {employee} = useFetchEmployee();

  if (!tasks || !employee) return <p>Loading...</p>;

  console.log('reports',employee.reports);
  console.log("Tasks:", tasks);


  return (
    <>
      {tasks.map((task) => {
        const reportObj = employee.reports?.find(
          (report) => report.taskId.toString() === task._id.toString()
        );
        return (
          <div key={task._id}>
            <TaskCard task={task} report={reportObj?.pdfUrl || ""} />
          </div>
        );
      })}
    </>
  );
}
