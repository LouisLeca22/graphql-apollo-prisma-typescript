import React from "react";
import { useParams } from "react-router";
import AddPostModal from "../../components/AddPostModal/AddPostModal";
import Post from "../../components/Post/Post";
import {gql, useQuery} from "@apollo/client"

const GET_PROFILE = gql`
query GetProfile($userId: ID!) {
  profile(userId: $userId){
    bio
    isMyProfile
    user {
      id 
      name
      posts{
        id
        title
        content
        createdAt
        published
      }
    }
  }
}
`

export default function Profile() {
  const { id } = useParams();
  const {data, error, loading} = useQuery(GET_PROFILE, {
    variables: {
      userId: id
    }
  })

  console.log(error)
  
  if(error) return <div>Error</div>
  if(loading) return <div>loading...</div>

  return (
    <div>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex ",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>{data.profile.user.name}</h1>
          <p>{data.profile.bio}</p>
        </div>
        <div>{data.profile.isMyProfile ? <AddPostModal /> : null}</div>
      </div>
      <div>
        {data.profile.user.posts.map(post => (
          <Post key={post.id}  title={post.title} content={post.content} date={post.createdAt} user={data.profile.user.name} published={post.published} isMyProfile={data.profile.isMyProfile} id={post.id}/>
        ))}
      </div>
    </div>
  );
}
