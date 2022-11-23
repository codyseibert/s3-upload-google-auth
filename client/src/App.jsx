import { useState } from "react";
import "./App.css";
import { useEffect } from "react";
import { uploadFile } from "./api/uploadFile";
import { API_URL } from "./api/config";
import { getFiles } from "./api/getFiles";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState();
  const [uploads, setUploads] = useState([]);

  function handleFileSelect(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newFile = await uploadFile(file);
    setUploads([...uploads, newFile]);
  }

  useEffect(() => {
    getFiles().then((files) => {
      setUploads(files);
      setIsAuthenticated(true);
    });
  }, []);

  return (
    <div className="App">
      {!isAuthenticated ? (
        <a href={`${API_URL}/auth/google`}>login</a>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="file">File</label>
          <input onChange={handleFileSelect} id="file" type="file"></input>
          <button>upload</button>

          {uploads.map((upload) => (
            <div key={upload._id}>
              <a href={`${API_URL}/files/${upload.filename}`}>
                {upload.filename}
              </a>
            </div>
          ))}
        </form>
      )}
    </div>
  );
}

export default App;
