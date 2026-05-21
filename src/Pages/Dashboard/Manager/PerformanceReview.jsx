import '../../../Components/Dashboard/Dashboard.css';

export default function PerformanceReview() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Review</h1>
          <p className="page-subtitle">Evaluate team performance and provide feedback.</p>
        </div>
        <div className="header-actions">
           <button className="action-btn"><i className="fa-solid fa-plus"></i> New Review</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <h3 className="card-title">
             <div className="card-icon"><i className="fa-solid fa-star"></i></div>
             Recent Reviews
           </h3>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Quarter</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">Alice Smith</td>
                <td>Q3 2023</td>
                <td className="cell-primary">Exceeds Expectations</td>
                <td><span className="badge success">Completed</span></td>
                <td>
                  <div className="table-actions">
                     <button className="table-action-btn"><i className="fa-regular fa-eye"></i></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="cell-primary">Charley Brown</td>
                <td>Q3 2023</td>
                <td>--</td>
                <td><span className="badge warning">Draft</span></td>
                <td>
                   <div className="table-actions">
                     <button className="table-action-btn"><i className="fa-solid fa-pen"></i></button>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
