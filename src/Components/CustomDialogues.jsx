import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";

const CustomDialog = ({
  title,
  message,
  icon,
  iconColor,
  buttonText,
  buttonAction,
  buttonLoading,
  hideDialog,
}) => {
  return (
    <Dialog
      open={!!message}
      onClose={hideDialog}
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-description"
      PaperProps={{
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        },
      }}
    >
      <DialogTitle id="custom-dialog-title" style={{ textAlign: "center" }}>
        {icon && (
          <span
            className="material-icons"
            style={{
              fontSize: 60,
              color: iconColor,
              display: "block",
              textAlign: "center",
            }}
          >
            {icon}
          </span>
        )}
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent style={{ textAlign: "center", padding: 16 }}>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions style={{ justifyContent: "center", padding: 16 }}>
        <Button
          onClick={buttonAction || hideDialog}
          variant="contained"
          color="primary"
          disabled={buttonLoading}
          style={{ minWidth: 100 }}
        >
          {buttonLoading ? "Loading..." : buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
