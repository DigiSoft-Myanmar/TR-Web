// ** MUI Imports
import { formatDate } from "@/util/textHelper";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import { styled } from "@mui/material/styles";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow, { TableRowProps } from "@mui/material/TableRow";
import TableCell, {
  TableCellProps,
  tableCellClasses,
} from "@mui/material/TableCell";

import React from "react";
import { Box, Card, CardHeader } from "@mui/material";
import Icon from "@/components/presentational/Icon";

const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: "#DE711B",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)<TableRowProps>(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },

  // hide last border
  "&:last-of-type td, &:last-of-type th": {
    border: 0,
  },
}));

function UsageTbl({ data }: any) {
  return data ? (
    <Card>
      <h3 className="p-5 text-lg font-semibold">{`Usage History`}</h3>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Visit Date</StyledTableCell>
              <StyledTableCell align="left">Ip Address</StyledTableCell>
              <StyledTableCell align="right">Device</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row: any, key: number) => (
                <StyledTableRow key={key}>
                  <StyledTableCell component="th" scope="row">
                    {formatDate(row.visitDate)}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {row.ipAddress}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyItems: "flex-end",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Icon
                        icon={
                          row.isMobile === true
                            ? "mdi:cellphone"
                            : "mdi:monitor"
                        }
                        fontSize={20}
                      />
                      <span className="ml-3">
                        {row.isMobile === true ? "Mobile" : "Desktop"}
                      </span>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell
                  component="th"
                  scope="row"
                  colSpan={3}
                  align="center"
                >
                  No Data
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  ) : (
    <></>
  );
}

export default UsageTbl;
