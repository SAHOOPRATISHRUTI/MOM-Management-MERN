import React, { useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress } from "@mui/material";
import { importfromcsv } from "../../services/api";
import { toast } from "react-toastify";

const Fileupload = () => {
  const [Opendialog, setopendialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);  // Added state for loading

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setLoading(true);  // Show loader when file is uploading
      try {
        const response = await importfromcsv(file);

        console.log("response -------------", response);

        toast.success(response.message);
        console.log('CSV file uploaded successfully');
      } catch (error) {
        console.error('File upload failed:', error.message);
        toast.error('File upload failed!');
      } finally {
        setLoading(false);  // Hide loader when done
      }
    } else {
      console.log('No file selected');
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
    document.getElementById('file-input').click();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickedOpen}
        disabled={loading}  // Disable button during loading
        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}  // Show CircularProgress as a start icon
        style={{ position: 'relative', minWidth: 120 }}
      >
        {loading ? 'Uploading...' : 'Import CSV'}
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
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </>
  );
};

export default Fileupload;
