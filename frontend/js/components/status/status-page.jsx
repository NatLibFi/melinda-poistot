import React from 'react';

const statusPath = __DEV__ ? 'http://localhost:3001/status': '/status';

export class StatusPage extends React.Component {

  static propTypes = {

  }
  constructor() {
    super();

    this.state = {
      jobs: [],
      error: undefined
    };
  }

  componentDidMount() {

    const fetchOptions = {
      method: 'GET',
      credentials: 'include'
    };

    fetch(statusPath, fetchOptions).then(response => {
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      
      response.json().then(body => {
        this.setState({
          jobs: Object.values(body),
          error: undefined
        });
      });
    }).catch(error => {
      this.setState({
        jobs: [],
        error
      });
    });
  }

  renderSingleJob(job) {
   
    const {jobId, allTasksCount, incompleteTaskCount} = job;
    const doneTasks = allTasksCount - incompleteTaskCount;
    return (<tr><td>{jobId}</td><td>{doneTasks}/{allTasksCount}</td></tr>);
  }

  renderJobTable() {

    return (
      <table>
      <thead>
        <tr><th>JobId</th><th>status</th></tr>
      </thead>
      <tbody>
        {this.state.jobs.map(this.renderSingleJob)}
      </tbody>
      </table>
    );
  }
  renderError() {
    return (
      <div className="row">
        <div className="col s12 m5">
          <div className="card-panel red lighten-3">
            <span>{this.state.error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.renderJobTable() }
        { this.state.error ? this.renderError() : null }
      </div>
    );
  }

}
