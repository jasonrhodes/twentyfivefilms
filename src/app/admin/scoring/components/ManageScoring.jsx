'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input
} from '@/components/MaterialTailwind';
import { IconFunctionFilled } from '@tabler/icons-react';

export default function ManageScoring({
  scoreMultipliers,
  setScoreMultipliers,
  className = ''
}) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  return (
    <div className={className}>
      <div
        className="flex cursor-pointer mb-2"
        onClick={() => setManageDialogOpen(true)}>
        <IconFunctionFilled size={24} />
        <span className="ml-1">Manage Scoring</span>
      </div>
      <Dialog
        open={manageDialogOpen}
        handler={() => setManageDialogOpen(!manageDialogOpen)}>
        <DialogHeader>
          <IconFunctionFilled size={32} />{' '}
          <span className="pl-2">Manage Scoring Multipliers</span>
        </DialogHeader>
        <DialogBody>
          <div className="mb-5">
            <Input
              type="number"
              step={0.1}
              label="Favorite Multiplier"
              value={scoreMultipliers.favorite}
              onChange={(e) =>
                setScoreMultipliers({
                  ...scoreMultipliers,
                  favorite: Number(e.target.value)
                })
              }
            />
          </div>
          <div>
            <Input
              type="number"
              step={0.1}
              label="HM Multiplier"
              value={scoreMultipliers.hm}
              onChange={(e) =>
                setScoreMultipliers({
                  ...scoreMultipliers,
                  hm: Number(e.target.value)
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="mr-1"
            color="blue"
            onClick={() => setManageDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
