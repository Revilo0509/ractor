import { useParams } from "react-router-dom";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();

  return <h1>Blog ID: {id}</h1>;
}
