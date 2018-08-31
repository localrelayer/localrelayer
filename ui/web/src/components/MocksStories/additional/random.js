export default function randomId(){
    return "0xe" + Math.round(Math.random() * 1000000000) + Math.random().toString(36).substring(12, 35) + Math.round(Math.random() * 1000000000) + Math.random().toString(36).substring(12, 45);
}
