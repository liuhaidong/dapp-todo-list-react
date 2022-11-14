import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import TodoList from './contracts/TodoList.json'
import {
  TODO_LIST_ADDRESS
} from './config.js'
import { ethers } from 'ethers'

class App extends Component {
  componentWillMount() {
    this.connectWallet()
    //this.loadBlockchainData()
    
  }

  async connectWallet() {
    try {


        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // MetaMask requires requesting permission to connect users accounts
        const accounts =await provider.send("eth_requestAccounts", []);
        this.setState({ account: accounts[0] })
        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const signer = provider.getSigner()
        const todoList = new ethers.Contract(TODO_LIST_ADDRESS, TodoList.abi, signer)
        console.log(TodoList)
        this.setState({ todoList })
        let taskCount = await todoList.taskCount()
        taskCount = taskCount.toNumber()
        console.log(taskCount)  
        this.setState({ taskCount })
        for (var i = 1; i <= taskCount; i++) {
          const task = await todoList.tasks(i)
          this.setState({
            tasks: [...this.state.tasks, task]
          })
        }
      } catch (error) {
        console.log(error)
		}  
  }
  
  async loadBlockchainData() {   
    const web3 = new Web3("http://localhost:8545")//Web3.givenProvider || "http://localhost:8545"
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log(TodoList)
    const todoList = new web3.eth.Contract(TodoList.abi, TODO_LIST_ADDRESS)
    this.setState({ todoList })
    const taskCount = await todoList.methods.taskCount().call()
    console.log(taskCount)  
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      account: '',
      taskCount: '',
      tasks: [],
      provider: null}
    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  createTaskM(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
    this.setState({ tasks: [] })
    this.loadBlockchainData()
  }

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
    this.setState({ tasks: [] })
    this.loadBlockchainData()
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    console.log(taskId)
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  

  render() {
    return (
      <div className="container">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.com/" target="_blank">Dapp | Todo List</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
          </nav>
        <div className="container-fluid">
          <div className="row">
            <p>a</p>
            <p>Your account0: {this.state.account}</p>
            <p>Task count: {this.state.taskCount}</p>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault()
            this.createTask(this.task.value)
          }}>
            <input
            id="newTask"
            ref={(input) => {
              this.task = input
            }}
            type="text"
            className="form-control"
            placeholder="Add task..."
            required />
            <input type="submit" hidden="" />
          </form>
          <ul id="taskList" className="list-unstyled">
              { this.state.tasks.map((task, key) => {
                return(
                  <div className="taskTemplate" key={key}>
                    <label>
                      <input
                    type="checkbox"
                    name={task.id}
                    defaultChecked={task.completed}
                    ref={(input) => {
                      this.checkbox = input
                    }}
                    onClick={(event) => {
                      this.toggleCompleted(task.id) }}/>
                      <span className="content">{task.content}</span>
                    </label>
                  </div>
                )
              })}
            </ul>
          </div>
      </div>
    );
  }
}

export default App;