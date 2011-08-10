##SITS-Moodle Integration Block for Moodle 1.9

##Installation

1) Copy the directory 'sits' into <moodle_root>/blocks/

2) Edit the file <moodle_root>/blocks/sits/config/sits_config.php to configure the block with your SITS database user, password and host address.

3) On the Moodle homepage click 'Notifications' - Moodle will then install the block.

##Be Aware

**Currently, the block only supports SITS on Oracle databases**.

**The block requires PHP version 5.3**

**Certain validation functions may need to be customised**.
We validate some data via regular expression pattern matching, in particular SITS module and program codes.  These patterns are unique to Bath;
they will need to be customised appropriately for other installs of SITS.  At present this must be achieved by altering the code - in the future
we may add an admin interface to alter these patterns, should the need arise.  

**If your Moodle is using MySQL with MyISAM table engines, and depending on the number of mappings made, the Full Sync of all mappings 
may have an adverse effect on Moodle's performance**.  This is due to the nature of MyISAM not supporting row-level locking, instead 
locking entire tables each time it is queried.   If you are using MySQL with InnoDB table engines, which is now default on v5.5.x and above,
the process should have little noticible effect on performance.  If you are using MyISAM engines you may wish to schedule Full Syncs in a quiet
period, or else simply sync each course individually.  On a wider note, you may wish to consider converting to InnoDB, which you may find
improves the performance of Moodle generally.

At the University of Bath we are running Moodle 5.5 on InnoDB tables. 
take considerably longer as each mapping is processed for the first time.

The block creates courses in Moodle for each and every active cohort in SITS - this is a requirement of the University of Bath, it may
not be desirable in every institution.  It would be a simple code change to change this behaviour, and should there be demand we may
write this in as a configurable option.

If a mapping finds that it wants to make an enrolment but that enrolment already exists it will takes ownership, linking that enrolment 
to the mapping, unless the role_assignment.enrol value is 'manual'.
