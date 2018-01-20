
import React from "react";
import ReactDOM from "react-dom";
import Highcharts from "highcharts/highstock";
import addFunnel from "highcharts/modules/funnel";
import openSocket from 'socket.io-client';
{/*const socket = openSocket('https://whispering-caverns-54453.herokuapp.com/');*/}
var socket = io.connect('/');

class App extends React.Component{
    constructor(props) {
    super(props);
    this.state = {
        messagedata: null,
        loaded: false,
        input: '',
        submit: '',
        deleteinput: '',
        deletesubmit: '',
        noData: false,
        username: null,
        logged: false,
        };
    }
    
    componentDidMount() {
        
        
        socket.on('update', (j) => {
		        
		        if(j.messages!=null){
		            this.setState({
                    messagedata: j.messages,
                    username: j.username,
                    loaded: true,
                    noData: (j.length==0)
                    }, function(){$(".messages").scrollTop($(".messages")[0].scrollHeight);});
		        }
		        else{
		            this.setState({
                    loaded: true,
                    noData: true
                    });
		        }
		        

        
            
        });
        
    }
    
    handleInput = (event) => {
        this.setState({
            input: event.target.value
        });
    }
    
    handleSubmit = (event) => {
        this.setState({
            submit: this.state.input,
            input: ''
        }, this.submitMessage);
    }
    
    handleDeleteInput = (event) => {
        this.setState({
            deleteinput: event.target.value
        });
    }
    
    handleDelete = (event) => {
        this.setState({
            deletesubmit: this.state.deleteinput,
            deleteinput: ''
        }, this.deleteStock);
    }
    
    handleButtonDelete = (data) => {

        this.setState({
            deletesubmit: data,
            deleteinput: ''
        }, this.deleteStock);
    }
    
    submitMessage = () => {
            console.log('submitmessage');
            var result = {
                username: this.state.username,
                message: this.state.submit
            }
            socket.emit('add', result);
    }
    
    deleteStock = () => {
        this.setState({
            loaded: false
        }, function(){
        var temp = this.state.series.slice();
        var result = [];
        var length = temp.length;
        var stockName = '';
        for(var x=0;x<length;x++){
            if(x!=Number(this.state.deletesubmit)){
                result.push(temp[x]);
            }
            else{
                stockName = temp[x].name;
            }
        }
		socket.emit('delete', stockName);
        });
    }
    
   render(){
            console.log
            var display = null;
            if(this.state.messagedata!=null){
                var display = this.state.messagedata.map((message,index) => 
                <p key={index}>{message.username}: {message.message}</p>
                );
            }

            return (
           <div style={{margin:0,padding:0,overflow:'hidden',textAlign:'center'}}>
            <div className='ChatApp'>
                <div className='nonInput'>
                    <div className='messages'>
                        {display}
                    </div>
                    <div className='options'>
                        <div className='login'>
                            <Login/>
                        </div>
                        <div className='roomControl'>
                            <RoomControl/>
                        </div>
                    </div>
                </div>
                <div className='inputSection'>
                    <textarea type="text" placeholder="Enter new message..." value={this.state.input} onChange={this.handleInput}/>
                    <button onClick={this.handleSubmit}>Submit</button>
                </div>
                
            </div>

          </div>
          ); 
        
					
   }
      
   
}

class Login extends React.Component{
    constructor(props){
        super(props);
    this.state = {
        usernameInput: '',
        passwordInput: ''
    }
    }
    handleUsernameChange = (event) =>{
        this.setState({
            usernameInput: event.target.value
        });
    }
    handlePasswordChange = (event) =>{
        this.setState({
            passwordInput: event.target.value
        });
    }
    render(){
        
        return(
            <div className='loginBody'>
                <input type="text" placeholder="Username" value={this.state.usernameInput} onChange={this.handleUsernameChange}/>
                <input type="text" placeholder="Password" value={this.state.passwordInput} onChange={this.handlePasswordChange}/>
                <div className='loginButtonContainer'>
                    <button className='loginButton'>Login</button>
                    <button className='signupButton'>SignUp</button>
                </div>
            </div>
            );
    }
}

class RoomControl extends React.Component{
    constructor(props){
        super(props);
    this.state = {
        usernameInput: '',
        passwordInput: '',
        searchInput: '',
    }
    }
    handleUsernameChange = (event) =>{
        this.setState({
            usernameInput: event.target.value
        });
    }
    handlePasswordChange = (event) =>{
        this.setState({
            passwordInput: event.target.value
        });
    }
    handleSearchInputChange = (event) => {
            this.setState({
            searchInput: event.target.value
            });
    }
    handleSearchKeyPress = (event) => {
        if(event.key=='Enter'){
            this.submitSearch();
        }
    }
    submitSearch = () => {

    }
    render(){
        
        return(
            <div className='roomControlBody'>
                <div className='searchContainer'>
                    <input type="text" placeholder="Search Rooms..." onChange={this.handleSearchInputChange} onKeyPress={this.handleSearchKeyPress} value={this.state.searchInput}/>
                    <div className='loginButtonContainer'>
                        <button className='signupButton'>Search</button>
                        <button className='signupButton'>New</button>
                </div>
                </div>
                <div className='roomList'>
                    <div className='List'>
                    </div>
                    <div className='roomListButtonContainer'>
                        <button className='joinButton'>Join</button>
                    </div>
                </div>
            </div>
            );
    }
}

class StockBox extends React.Component{
    constructor(props){
        super(props);
    this.state = {
        delete: false
        }
    }
    delete = () => {
        this.setState({delete:true}, this.props.handleButtonDelete(this.props.index));
    }
    render(){
        var StockBoxStyle = {
            width: '40%',
            height: 70,
            borderBottomColor: 'black',
			borderBottomWidth: 1,
			borderBottomStyle: 'solid',
			display: 'inline-block',
			marginTop: 25,
			marginRight: '4%',
			marginLeft: '4%',
			marginBottom: 25,
			textAlign: 'center',
			position: 'relative'
        };
        var StockBoxTextStyle = {
            fontSize: 25,
            paddingTop: 10
        }
        var StockBoxExitStyle = {
            float: 'right',
            backgroundColor: 'black',
            border: '1px solid black',
            color: 'white'
        }
        var deleteText = {
            display: 'inline-block',
            color: 'darkred',
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }
        return(
            <div style={StockBoxStyle}>
            {
                this.state.delete &&
                <p style={deleteText}>Deleting...</p>
            }
                <button style={StockBoxExitStyle} onClick={this.delete}>X</button>
                <p style={StockBoxTextStyle}>{this.props.stockInfo.name}</p>
            </div>
            );
    }
}

class InputSection extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        var InputSectionStyle = {
            display:'inline-block',
            verticalAlign: 'top',
            margin: '50px 100px 0 0',
            float:'left',
        };
        var inputStyle = {
            border: '1px solid black',
            borderBottomLeftRadius: 5,
            borderTopLeftRadius: 5,
            height: 25,
            width: 150
        };
        var buttonStyle = {
            border: 'none',
            backgroundColor: 'black',
            height: 29,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
            verticalAlign: 'bottom',
            padding: '5px 5px 5px 5px',
            textAlign: 'center'
        }
        var buttonTextStyle = {
            fontSize: 20,
            color: 'white',
            fontWeight: 900,
            fontFamily: 'Tahoma',
            display:'inline-block',
            margin: '0 0 5px 0',
            padding: '0 0 0 0'
        }
        return(
            <div style={InputSectionStyle}>
                <h1>Input Stock Id</h1>
                <input style={inputStyle} type='text' value={this.props.input} onChange={this.props.handleInput}/>
                <button type='submit' onClick={this.props.handleSubmit} style={buttonStyle}><p style={buttonTextStyle}>Add</p></button>
            </div>
            );
    }
}

class DeleteSection extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div>
                <h1>Delete Stock Id</h1>
                <input type='text' value={this.props.input} onChange={this.props.handleDeleteInput}/>
                <button type='submit' onClick={this.props.handleDelete}>Delete</button>
            </div>
            );
    }
}

class SampleChart extends React.Component{

   componentDidMount() {
       
       
        // Extend Highcharts with modules
        if (this.props.modules) {
            this.props.modules.forEach(function (module) {
                module(Highcharts);
            });
        }
        // Set container which the chart should render to.
        this.chart = new Highcharts.stockChart(this.props.container,
            this.props.options
        );
        
    }
    //Destroy chart before unmount.
    componentWillUnmount() {
        this.chart.destroy();
    }
    //Create the div which the chart will be rendered to.
    render() {
        return (
            <div id={this.props.container}></div>
            );
    }
      
   
}

class ProjectInfo extends React.Component{
    constructor(props) {
    super(props);
    }
    
   render(){
            var divStyle = {
                backgroundColor: 'gray',
                width:'100%',
                minHeight:300,
                textAlign:'center',
                overflow:'hidden',
                verticalAlign: 'bottom'
                };
            var infoBoxStyle = {
                width:300,
                display:'inline-block',
                margin: '50px 50px 0px 50px',
                verticalAlign: 'top',
                textAlign: 'left',
                padding: '0px 0px 50px 30px',
                borderLeft:'2px solid black'
            };
            var pStyle = {
                fontFamily: 'Arial',
                color: '#E0E0E0',
                margin:0
            };
            var hStyle = {
                color: 'white',
                marginBottom:0
            };
            return (
               <div style={divStyle}>
                    <div style={infoBoxStyle}>
                        <h1 style={hStyle}>Background</h1>
                        <br/>
                        <p style={pStyle}>This stock market tracking app is a</p>
                        <br/>
                        <p style={pStyle}>FreeCodeCamp full-stack project</p>
                    </div>
                    <div style={infoBoxStyle}>
                        <h1 style={hStyle}>Technologies</h1>
                        <br/>
                        <p style={pStyle}>Front-end: React, Highcharts</p>
                        <br/>
                        <p style={pStyle}>Back-end: Express.js, Mongoose</p>
                    </div>
                    <div style={infoBoxStyle}>
                        <h1 style={hStyle}>Author</h1>
                        <br/>
                        <p style={pStyle}>David Magee is a web developer in</p>
                        <br/>
                        <p style={pStyle}>Houston, TX</p>
                    </div>
               </div>
          ); 
					
   }
      
   
}


ReactDOM.render(
        <App/>,
    document.querySelector("#container")
    );
    