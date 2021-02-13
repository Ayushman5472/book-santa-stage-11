import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import {BookSearch} from 'react-native-google-books';
import { FlatList } from 'react-native-gesture-handler';

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      isBookRequestActive:"",
      bookStatus:'',
      requestID:'',
      userDocID:'',
      docID:'',
      imageLink:'',
      dataSource:"",
      showFlatList: false,
      requestedBookName:'',
    }
  }

renderItem=({item,i})=>{
return(
  <TouchableHighlight style={{alignItems:'center', backgroundColor:'orange', padding: 20, width: '80%'}} 
  activeOpacity={0.5} underlayColor={"black"} onPress={()=>{
    this.setState({
      showFlatList:false,bookName:item.volumeInfo.title
    })
  }} bottomDivider>
    <Text>
      {item.volumeInfo.title}
    </Text>
  </TouchableHighlight>
)
}
  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

async BookSearch (BookName) {
this.setState({
  bookName:BookName
})
if (this.state.bookName.length > 2)
{
  var books = await BookSearch.searchbook(BookName, 'AIzaSyBULa1GvvvsdOtfqZ0LVFNSQC862Ok2ulQ')
  this.setState({
    dataSource: books.data, showFlatlist:true
  })
}
}

  addRequest =(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    var books = await BookSearch.searchbook(bookName, 'AIzaSyBULa1GvvvsdOtfqZ0LVFNSQC862Ok2ulQ')
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        bookStatus:'Requested',
        date: firebase.firestore.FieldValue.serverTimestamp(),

        imageLink:books.data[0].volumeInfo.imageLinks.smallThumbnail
    })
await this.bookRequest()
db.collection('users').where('email_id','==',this.state.user_id).get()
.then()
.then(snapshot=>{
  snapshot.forEach(doc=>{
    db.collection('users').doc(doc.id).update({
    isBookRequestActive:true
    
    })
  })
})
    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestID: randomRequestId,
    })

    return Alert.alert("Book Requested Successfully")
  }
bookRequest=()=>{
var bookRequest = db.collection('requested_books').where('user_id','==',this.state.userId).get()
.then(snapshot=>{
  snapshot.forEach(doc=>{
    if(doc.data().bookStatus !== 'Recieved'){
this.setState({
  requestID:doc.data().request_id,
  requestedBookName:doc.data().book_name,
  bookStatus:doc.data().bookStatus,
  docID:doc.id,
})
    }
  })
})
}
getBokRequestActive(){
db.collection('users').where('email_id','==', this.state.userId)
.onSnapshot(snapshot=>{
  snapshot.forEach(doc=>{
    this.setState({
      isBookRequestActive:doc.data().isBookRequestActive,
      userDocID:doc.id
    })
  })
})
}
recievedBooks=(bookName)=>{
var userId = this.state.userId
var requestID = this.state.requestID
db.collection('recieved_books').add({user_id:userId,book_name:bookName,request_id:requestID, bookStatus:'Recieved'})

}
componentDidMount(){
  this.getBookRequestActive()
  this.bookRequest()
}
  render(){
    return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              /> {this.state.showFlatList? 
              (<FlatList data={this.state.dataSource} renderItem={this.renderItem} enableEmptySections={true}
              style={{marginTop:15}} keyExtractor={(item,index)=>{
                index.toString()
              }}/>)
              :( <View>
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
              </View>)}
            </KeyboardAvoidingView>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
