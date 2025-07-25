import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import NavBar from "../NavBar/NavBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import "./Analytics.css";

interface FeedbackItem {
  username: string;
  category: string;
  comment: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Analytics = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const allFeedbacks: FeedbackItem[] = JSON.parse(
      localStorage.getItem("allFeedbacks") || "[]"
    );
    setFeedbacks(allFeedbacks);

    const categoryCount: { [key: string]: number } = {};
    allFeedbacks.forEach((fb) => {
      categoryCount[fb.category] = (categoryCount[fb.category] || 0) + 1;
    });

    const pieData = Object.keys(categoryCount).map((key) => ({
      name: key,
      value: categoryCount[key],
    }));

    setData(pieData);
  }, []);

  const handlePieClick = (entry: any, index: number) => {
    setSelectedCategory(entry.name);
    setActiveIndex(index);
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setActiveIndex(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Feedbacks in "${selectedCategory}"`, 10, 10);
    const rows = filteredFeedbacks.map((fb) => [
      fb.username,
      fb.category,
      fb.comment,
    ]);
    autoTable(doc, {
      head: [["User", "Category", "Comment"]],
      body: rows,
    });
    doc.save(`feedbacks_${selectedCategory}.pdf`);
  };

  const filteredFeedbacks = selectedCategory
    ? feedbacks.filter((fb) => fb.category === selectedCategory)
    : [];

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * props.midAngle);
    const cos = Math.cos(-RADIAN * props.midAngle);
    const sx = props.cx + (props.outerRadius + 10) * cos;
    const sy = props.cy + (props.outerRadius + 10) * sin;
    const mx = props.cx + (props.outerRadius + 30) * cos;
    const my = props.cy + (props.outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={props.cx} y={props.cy} dy={8} textAnchor="middle" fill="#333">
          {props.name}
        </text>
        <Sector
          cx={props.cx}
          cy={props.cy}
          innerRadius={props.innerRadius}
          outerRadius={props.outerRadius + 10}
          startAngle={props.startAngle}
          endAngle={props.endAngle}
          fill={props.fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={props.fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={props.fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`Count: ${props.value}`}</text>
      </g>
    );
  };

  return (
    <>
      <NavBar />
      <div className="analytics-container">
        <h2>Feedback Category Distribution</h2>
        <p className="total-count">📊 Total Feedbacks: {feedbacks.length}</p>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={130}
                label
                onClick={handlePieClick}
                
                activeShape={renderActiveShape}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No feedbacks available to analyze.</p>
        )}

        {selectedCategory && (
          <div className="feedback-table-section">
            <h3>Feedbacks in "{selectedCategory}"</h3>
            <div className="btn-row">
              <button onClick={handleClearSelection} className="btn clear-btn">
                Clear Selection
              </button>
              <button onClick={handleExportPDF} className="btn pdf-btn">
                Export PDF
              </button>
              <CSVLink
                data={filteredFeedbacks}
                headers={[
                  { label: "User", key: "username" },
                  { label: "Category", key: "category" },
                  { label: "Comment", key: "comment" },
                ]}
                filename={`feedbacks_${selectedCategory}.csv`}
                className="btn csv-btn"
              >
                Export CSV
              </CSVLink>
            </div>

            <table className="feedback-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Category</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((fb, index) => (
                  <tr key={index}>
                    <td>{fb.username}</td>
                    <td>{fb.category}</td>
                    <td>{fb.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;
