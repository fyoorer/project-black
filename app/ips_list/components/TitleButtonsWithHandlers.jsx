import React from 'react'
import { Button, DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap'

import TasksSocketioEventsEmitter from '../../redux/tasks/TasksSocketioEventsEmitter.js'
import ButtonsTasks from './ButtonsTasks.jsx'


class TitleButtonsWithHandlers extends React.Component {

	constructor(props) {
		super(props);

		this.tasksEmitter = new TasksSocketioEventsEmitter();

		this.runMasscan = this.runMasscan.bind(this);
		this.runNmap = this.runNmap.bind(this);
		this.runNmapOnlyOpen = this.runNmapOnlyOpen.bind(this);
	}

	runMasscan(params) {
		var targets = _.map(this.props.scopes.ips, (x) => {
			return x.ip_address || x.hostname
		});

		this.tasksEmitter.requestCreateTask('masscan', 
											targets, 
											{'program': params}, 
											this.props.project.project_uuid)
	}

	runNmap(params) {
		var targets = _.map(this.props.scopes.ips, (x) => {
			return x.ip_address;
		});

		this.tasksEmitter.requestCreateTask('nmap', 
											targets, 
											{'program': params}, 
											this.props.project.project_uuid)
	}	

	runNmapOnlyOpen(params) {
		var nonuniqueTargets = _.map(this.props.scans, (x) => {
			return x.target;
		});

		var targets = _.uniq(nonuniqueTargets);
		var startTime = 0;

		for (var target of targets) {
			let filtered_scans = _.filter(this.props.scans, (x) => {
				return x.target == target;
			});

			let ports = _.map(filtered_scans, (x) => {
				return x.port_number;
			});

			let flags = "-p" + ports.join();

			this.tasksEmitter.requestCreateTask('nmap', 
												[target], 
												{
													'program': [flags, '-sV'],
													'saver': {
														'scans_ids': _.map(filtered_scans, (x) => {
															return {
																'scan_id': x.scan_id,
																'port_number': x.port_number
															}
														})
													}
												}, 
												this.props.project.project_uuid);
		}

	}	

	render() {
		return (
			<ButtonsTasks project={this.props.project}
						  tasks={
						  	[
						  		{
						  			'name': 'Masscan',
						  			'handler': this.runMasscan,
									"preformed_options": [
										{
											"name": "All Ports",
											"options": "-p1-65535"
										},
										{
											"name": "Top 1000 ports",
											"options": "-p80,23,443,21,22,25,3389,110,445,139,143,53,135,3306,8080,1723,111,995,993,5900,1025,587,8888,199,1720,113,554,256"
										}
									]
						  		},
						  		{
						  			'name': 'Nmap',
						  			'handler': this.runNmap,
									"preformed_options": [
										{
											"name": "All Ports",
											"options": "-p1-65535"
										},
										{
											"name": "Top ports",
											"options": "-p80,23,443,21,22,25,3389,110,445,139,143,53,135,3306,8080,1723,111,995,993,5900,1025,587,8888,199,1720,113,554,256"
										}
									]
						  		},
						  		{
						  			'name': 'Nmap Only Open Ports',
						  			'handler': this.runNmapOnlyOpen,
									"preformed_options": [
										{
											"name": "Banner",
											"options": "-sV"
										}
									]
						  		}
						  	]
						  } />
		)
	}

}


export default TitleButtonsWithHandlers;