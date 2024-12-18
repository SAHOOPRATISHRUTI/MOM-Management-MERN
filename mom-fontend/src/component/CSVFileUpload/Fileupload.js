import React, { useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress, Link } from "@mui/material";
import { importfromcsv } from "../../services/api";
import { toast } from "react-toastify";

const Fileupload = () => {
  const [Opendialog, setopendialog] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
  
    if (file) {
      setLoading(true);
      try {
        const response = await importfromcsv(file);
        console.log("Response:", response);
  
   
        toast.success(response.message);
  
 
        const skippedFilePath = response.data?.skippedFilePath;
  
        if (skippedFilePath) {
          const fileName = skippedFilePath.split(/[/\\]/).pop(); 
          const downloadUrl = `http://localhost:5000/uploads/${fileName}`; 
          console.log("downloadUrl",downloadUrl);
          toast.warn(
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "500", color:"white" }}>
                Some records were skipped during upload!
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "red",
                  textDecoration: "underline",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Click here to download the skipped file
              </a>
            </div>
          );
          
        }
        
        //console.log("CSV file uploaded successfully");
  
      } catch (error) {
        //console.error("File upload failed:", error.message);
        toast.error(error.message); 
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No file selected");
    }
  };
  

  const handleClickedOpen = () => {
    setopendialog(true);
  };

  const handleCloseDialog = () => {
    setopendialog(false);
  };

  const handleConfirmUpload = () => {
    setopendialog(false);
    document.getElementById("file-input").click();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickedOpen}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
        style={{ position: "relative", minWidth: 120 }}
      >
        {loading ? "Uploading..." : "Import CSV"}
      </Button>

      <Dialog open={Opendialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Upload</DialogTitle>
        <DialogContent>Are you sure you want to upload a CSV file?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            No
          </Button>
          <Button onClick={handleConfirmUpload} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <input
        type="file"
        id="file-input"
        accept=".csv,.txt,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </>
  );
};

export default Fileupload;
