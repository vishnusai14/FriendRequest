import React , { Component } from "react"
import axios from "axios"
import Navigation from "../Navigation/navigation"
import Spinner from "../Spinner/spinner"
import { connect } from "react-redux"
class Blog extends Component {
    state = {

        userName : "",
        isLoading : true
       
    }



    componentDidMount = () => {
        let data = {
            token : this.props.token || localStorage.getItem('SSUID')
        }
        axios.post("/check" , data)
        .then((response) => {
          
            if(response.data){
              
                localStorage.setItem('SSUID' , data.token)
                this.setState(prevState => ({
                    ...prevState,
                    userName : response.data.user,
                    isLoading : false,
                    isAuth : true,

                }))
            }
           
        })
        .catch((err) => {
            this.setState(prevState => ({
                ...prevState,
                isLoading : false,
                isAuth : false
            }))
        })
    }

    

    render () {
    
        return (
            this.state.isLoading ? <><Spinner/></> : this.state.isAuth ? 
           <> <Navigation/><h1>Hello ,  {this.state.userName}<i style  = {{marginLeft : "10px"}} className="fas fa-user"></i></h1></>
             : <><h1>Please Login <a href = "/"> Login</a></h1></>  
                        
        )
    }

}


const mapStateToProps = (state) => {
    return {
        token : state.token,
        serverError : state.error,
        loading : state.isLoading
    }
}


export default connect(mapStateToProps)(Blog)