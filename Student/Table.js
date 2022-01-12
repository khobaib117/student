import * as React from 'react';
import {useEffect, useState, useCallback} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {
  View,
  Text,
  StyleSheet,
  Touchable,
  ScrollView,
  RefreshControl,
  Platform,
  ToastAndroid,
  AlertIOS
} from 'react-native';
import {Table, Row, Rows} from 'react-native-table-component';
import * as db from './db';
import {TouchableOpacity} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tableHead = ['Title', 'Subject', 'Status', 'Action'];


const App = ({navigation}) => {
  const [assignment, setAssignment] = useState();
  const [tableData, setTableData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  
  let temp = [];
  useEffect(() => {
    getOnlineUser();
    navigation.setOptions({
      title:"Assignments"
    })

  }, []);
  useEffect(() => {
    setAssignment(db.default.getAssignments());
  }, []);
  const getOnlineUser = async () => {
    try {
      let jsonValue = await AsyncStorage.getItem('email');
      let jsonValue1 = await AsyncStorage.getItem('name');
      if (jsonValue != null) {
        setEmail(JSON.parse(jsonValue));
        setName(JSON.parse(jsonValue1));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTableData([]);
    setAssignment(db.default.getAssignments());
    setRefreshing(false);
  });
  const hasValue = (obj, key, value) => {
    return obj.hasOwnProperty(key) && obj[key] === value;
  };
  const checkValue = (attempted, std) => {
    if (email == undefined) {
      getOnlineUser();
    }
    // console.log(Object.values(attempted));
    const result = attempted.some(function (boy) {
      return hasValue(boy, 'email', email);
    });

    return result;
  };
  const showNumber = item => {
    if (email == undefined) {
      getOnlineUser();
    }
    console.log(item)
    if (item.length > 0) {
      item.map((mem, index) => (
        <View>
        
          {item.length - 1 == index ? (
            <View>
              {mem.email == email
                ? showmsg('Marks: ' + mem.marks)
                : showmsg('Yet Not Attempted')}
            </View>
          ) : (
            <View>
              {mem.email == email ? showmsg('Marks: ' + mem.marks) : null}
            </View>
          )}
        </View>
      ));
    } else {
      showmsg('Yet Not Attempted');
    }
  };
  const showmsg = msg => {
    if (Platform.OS === 'android') {
     
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}>
      <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
        <Row data={tableHead} style={styles.head} textStyle={styles.text} />
        <Rows data={tableData} textStyle={styles.text} />
      </Table>
      {assignment != undefined  && tableData.length < assignment.length ? (
        <View>
          {assignment.forEach((element, index) => (
            <View key={index}>
              {(temp = [])}
              {(temp[0] = element.title)}
              {temp.push(element.className)}

              {element.attempt? temp.push(
                checkValue(Object.values(element.attempt))
                  ? 'Attempted'
                  : 'Not Attempt',
              ):temp.push("Not Attemp")}

              {temp.push(
                <TouchableOpacity
                  style={{alignSelf: 'center'}}
                 
                  onPress={() =>{
                    element.attempt?<>
                   {checkValue(Object.values(element.attempt))?showNumber(Object.values(element.attempt)):navigation.navigate('mcqs', {
                      question: element.questions,
                      id: element.id,
                    })}

                    </> :navigation.navigate('mcqs', {
                      question: element.questions,
                      id: element.id,
                    })

                    

                  }
                    
                  

                    
                  }>
                  {element.attempt? <>
                {checkValue(Object.values(element.attempt))
                  ? <FontAwesome5 name="eye" size={20} />
                  : <FontAwesome5 name="edit" size={20} />}
                  </> :<FontAwesome5 name="edit" size={20} />}
                  
                </TouchableOpacity>,
              )}
             
              {tableData.push(temp)}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
  },
});
