# To-do List

To-do List (MakeList) is a website handling to-do list items,<br>
where users may
- ***add* items** to the list
- ***delete* items** from the list
- ***edit* items** in the list
- ***check* or *uncheck*** items
- ***save* a list** of items on the **web browser**
- ***delete* a list** of items saved on the **web browser**
- ***load* a list** of items saved on the **web browser**
- **export** the list as a **text file**
- **import a text file** to create a *new* list

and so on.

# How to use the To-do List (MakeList)

## Functions

### i. ***Add* list items**
To add items to the list,
simply enter ***something*** at the tab writing<br>
**"enter a name for the new item"**,<br>
then click the button **"add an item"**.

For *desktops and notebooks*, it can also be done by pressing ***Enter***.

*An item to be added* can be a space, a tab key, a name, or even a duplicate item, etc.

It must NOT be **empty**, though, i.e. **""**.

### ii. ***Sort* list items**

To sort items in the list,
simply click the button **"sort items"**.

The sequence of items in the list can be changed by **dragging an item *at a time***.

There are three types of sorting items in the list:
- in ***ascending*** order<br>
Arrange all items from **smallest to largest**, i.e. A-Z, a-z, 0-9.<br>
**After sorting**:<br>
  the *greater* an item is, the closer it is to the **bottom** of the list;<br>
the *smaller* an item is, the closer it is to the **top** of the list;

- in ***descending*** order<br>
Arrange all items from **largest to smallest**, i.e. Z-A, z-a, 9-0.<br>
**After sorting**:<br>
  the *greater* an item is, the closer it is to the **top** of the list;<br>
the *smaller* an item is, the closer it is to the **bottom** of the list;

- in a ***random*** order<br>
Arrange all items in a completely random manner.<br>
It is done using ***Fisher–Yates* shuffle**.

### iii. ***Clear* list**

To clear all items in the list,
simply click the button **"clear list"**.

Doing so will clear ***all* items** in the list.
The list **saved in the *web browser*** (if there is one) won't be affected.

This action **CANNOT** be undone.

### iv. ***Save* list**

To save the list to the web browser,
click the button ***save as a file***.

Doing so saves the current list to the web browser.

If there is already one saved in the web browser, then<br>
- if the user clicks ***OK***, the new list overwrites the one saved in the browser
- if the user clicks ***Cancel***, the list saved in the web browser does not get affected.

### v. ***Load* list**

To load the list saved in the web browser,
click the button ***load file***.

Doing so loads the list saved in the web browser to form a current one.

If there is already a list being used, then<br>
- if the user clicks ***OK***, the list saved in the browser overwrites the one being used
- if the user clicks ***Cancel***, the list being used does NOT get affected.

### vi. ***delete* list**

To delete the list saved in the web browser,
click the button ***delete file***.

Doing so delete the list saved in the web browser (if there is already one).

This action **CANNOT** be undone.

### vii. ***export* list**

Doing so exports the *current* list as a **text file**.<br>
By default, the file name is **"to-do list"**.<br>
The user may **enter a custom file name** as well.

### viii. ***import* a file**

Doing so imports a file to **form a list**.<br>

This function accepts
- *text* files
- *csv* files
- *rtf* files

## Item functions

### checking

When checked (similar to ✅), the item becomes grey and gets stricken.

### edit

Change the contents of a list item.<br>
The contents must NOT be empty after editing.

### delete

Remove a list item from a list<br>
The item as well as its contents and checking status<br>
will be gone for good<br>
and **CANNOT** be undone.

Or you can check out [this page] (https://21j2jw9ssa.github.io/to-do-list/help/todolist-help.html) for detailed help.
